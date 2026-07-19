---
layout: ../layouts/Escrito.astro
title: "lab"
subtitle: "From KV caches to gallery walls"
date: "2026–present"
description: "Research notes on low-level inference for image models. CUDA kernels, quantization, fidelity benchmarks, and the installations that run on them."
type: "pesquisa"
---

## What this is

I make installations that people walk into, and I write the low-level code that makes them run. For the past year that code lived inside large language models. I built custom CUDA kernels for KV-cache quantization, published benchmarks under the TurboQuant and kv-score projects, and learned where I could actually be useful there. The field publishes speedups by the dozen and measures fidelity thinly, so I brought the habits that survive scrutiny. Multi-seed measurements, versioned test sets, failure analysis, numbers that carry their measurement conditions wherever they go.

In July 2026 I moved that practice to image models. The goal is a diffusion transformer running in real time, at the lowest level of the stack I can reach, feeding work that hangs in exhibition spaces. My earlier pieces already walked toward this. METADATA rendered live data as fluid simulation for six months at SESI. São Paulo 3024 put language models and computer vision inside an interactive installation. Player 1 turned the visitor's body into the controller. The missing piece has always been generation itself running at the speed of presence.

This page collects the research as it happens. The code and the full numbers live on GitHub, the finished works live in the [archive](/obras).

## Study 1. Five quantized builds of Krea 2, measured against each other

Krea 2 is a 12.9 billion parameter diffusion transformer released as open weights in June 2026. The community ships five quantized variants of its Turbo checkpoint, and no fidelity comparison between them existed. I measured all five on a single RTX 4090, at 1024x1024, with 12 versioned prompts and 8 fixed seeds per variant, every image paired seed to seed against the BF16 reference. That gives 96 pairs per variant, scored with LPIPS, PSNR and ImageReward delta.

| variant | LPIPS | PSNR | IR delta |
|---|---|---|---|
| int8 convrot, 8 steps | 0.066 | 27.7 | -0.010 |
| mxfp8, 8 steps | 0.115 | 24.0 | +0.004 |
| fp8 scaled, 8 steps | 0.120 | 23.6 | -0.024 |
| fp8 scaled, 4 steps | 0.326 | 17.8 | -0.054 |
| fp8 scaled, 2 steps | 0.531 | 15.0 | -0.523 |

The rotation-based int8 build wins by a wide margin. Half the perceptual distance of the fp8 builds, four more decibels of PSNR, a quality delta indistinguishable from zero. Rotating activations before quantizing them, an idea from the QuaRot family of methods, currently beats both fp8 paths on this hardware. Nobody had published that.

The table also says where the real cost lives. Format changes are nearly free at 8 steps. Cutting steps is not. At 4 steps the images diverge from the reference but hold their quality, at 2 steps quality collapses outright. The expensive axis is time, not bits.

![Painterly prompt across six builds](/img/lab/grid-painterly-step-collapse.png)

*Same seed, same prompt, six builds. The painterly prompt survives every format at 8 steps and dies with step reduction.*

![Low light prompt across six builds](/img/lab/grid-lowlight-quant-pain.png)

*Low light is where the quantization formats separate from each other.*

Quantization hurts low light, fine texture and product shots first. Step reduction kills painterly styles, and visible brushstroke structure is the first casualty. A benchmark that reports one aggregate number hides exactly this, which is why every per-pair score ships in the repo.

## Study 2. Ampere latency, and where fused kernels change the math

The fidelity study named int8 convrot the most faithful quant of the five. On an RTX 3090 it is also the fastest. Same protocol, warm median of three seeds, and at 1024 pixels the int8 build renders in 8.0 seconds against 15.6 for fp8 and 17.8 for mxfp8. Twice the speed and better quality from one format, because on this generation the INT8 tensor cores are a real hardware route while the fp8 formats fall back to a slower one. On a 3090 the choice makes itself.

| variant | 8 steps | 4 steps | 2 steps |
|---|---|---|---|
| int8 convrot | 8.0s | 4.5s | 2.5s |
| fp8 scaled | 15.6s | 8.0s | 4.5s |
| mxfp8 | 17.8s | 9.0s | 5.0s |

Those numbers are all storage quantization running through a general inference path. The formats shrink the file and the memory, they do not rewrite the arithmetic of the forward pass. A fused low-bit kernel does. To see how much that matters I benchmarked Nunchaku's INT4 FLUX.1-dev, which quantizes weights and activations to four bits with custom CUDA kernels, on the same 3090. It renders at roughly half a second per step at 1024 pixels, where the fp8 path on a same-sized model sits near two seconds. These are different models, so read it as an indication rather than a controlled trial, though the gap is a factor of three and a half. That gap is the whole reason the next section exists.

## Study 3. Four bits of weight and four bits of activation, measured on Krea 2

Every build in Study 1 is storage quantization. It makes the file smaller and leaves the arithmetic of the forward pass untouched. The lever that buys real time is different. It quantizes the weights and the activations both down to four bits and fuses the low-bit multiply into a custom kernel, and that rewrite is where the factor of three and a half in Study 2 comes from. Nobody had taken Krea 2 that far. So the first thing to do was build the four-bit checkpoint, and the second was to measure it. The build is the scarce part. The measurement is what tells you whether the build survived the cut. I did both, and here is what came out.

I quantized the Turbo checkpoint to W4A4 with the SVDQuant method, calibrated on a rented H100, and scored the result on the same 4090 and the same 96 seed-locked pairs as Study 1. The perceptual distance reads 0.268, near where the four-step build sits, which says the sampling trajectory moves to a neighboring image. The quality signal moved the other way. ImageReward came in at plus 0.052, the highest reading in the whole study, storage or fused. On average the reward model liked the four-bit images a touch more than full precision. Four bits of weight and four bits of activation, and quality held.

The reason it holds is the shape of the method. SVDQuant carries a small full-precision side branch next to the four-bit multiply, and that branch absorbs the handful of large activations that would otherwise wreck the last blocks of the transformer. I watched the calibration error climb block by block, roughly three times larger at the end than at the start, and the branch soaked it up. The collapse I expected in the final layers never reached the image. What remains is a build that shifts its compositions slightly and keeps its quality, and that is the only kind of quantization that turns into frames on a gallery wall.

The measured checkpoint is the artifact. The next step is running it through a fused kernel on my own cards, and after that, spending the four-bit budget where the model actually needs it instead of flat across every block.

## Study 4. The four-bit build runs in a fused runtime

Study 3 ended with a checkpoint and a promise, to run it through a fused kernel on my own cards. This study keeps the promise. I ported Krea 2 into the Nunchaku runtime, which carries custom kernels for four-bit weights and activations, and ran the checkpoint through them. It is the first time Krea 2 has generated an image with four-bit weights and activations through fused low-bit kernels instead of a simulation of them.

It generates correct images. I ran six prompts against the full-precision model on the same card, seed locked, and the four-bit output is coherent and detailed and keeps its quality. The perceptual distance averages 0.277, from 0.14 on a clean portrait to around 0.35 on fine texture and dense city scenes, which tracks the number Study 3 predicted from the simulation. The prompts that move the most shift their composition, they do not lose quality, the same behavior the whole benchmark keeps finding.

On speed, measured on an L40S with the four-bit and the full-precision model running the same attention path, the four-bit build renders a 1024 pixel image in 5.4 seconds against 7.5 for full precision, and a 512 pixel image in 1.35 against 2.19. At 512 pixels and two steps it reaches about two and a half images a second. The gain is 1.4 to 1.6 times, and it grows as the picture shrinks because attention takes less of the work and the quantized matmuls take more.

One thing cost me a day and is worth writing down. The first port ran four times slower than that, and the reason was mundane. The query and key tensors had drifted to full precision, and full precision has no fast attention kernel, so the machine fell back silently to the slow path. Casting them back down fixes it. I blamed the wrong thing first and a controlled test corrected me, which is the only reason the numbers above are trustworthy.

The four-bit build runs now, and it runs faster. The remaining distance to real time runs through folding more of the work into single kernels, spending the four-bit budget where the model needs it instead of flat across every block, and the cards I actually own.

## Where this goes

The current stack generates a 1024px image in 5.5 seconds on the 4090, measured warm, 8 steps, fp8. Real time for an installation means two orders of magnitude beyond that, and the road there runs through 4-bit weights and activations with fused CUDA kernels, temporal caching between frames, and honest fidelity gates at every stage. The harness that produced the table above is the gate. It is open source, and the numbers it produces are the kind I would want to read from anyone else.

Code, data and method live in [Dead Channel](https://github.com/sztlink/dead-channel), an open benchmark that measures where diffusion quantization tunes to static. The leaderboard is at [huggingface.co/spaces/felipesztutman/dead-channel](https://huggingface.co/spaces/felipesztutman/dead-channel). The LLM side of this practice lives at [kv-score](https://github.com/sztlink/kv-score).

![The reference fox](/img/lab/fox-bf16-ref.png)

*The reference fox. BF16, seed 1000, one of the 96 pairs behind each number above.*
