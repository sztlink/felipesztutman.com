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

| variant | LPIPS | PSNR | ImageReward delta |
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

## Where this goes

The current stack generates a 1024px image in 5.5 seconds on the 4090, measured warm, 8 steps, fp8. Real time for an installation means two orders of magnitude beyond that, and the road there runs through 4-bit weights and activations with fused CUDA kernels, temporal caching between frames, and honest fidelity gates at every stage. The harness that produced the table above is the gate. It is open source, and the numbers it produces are the kind I would want to read from anyone else.

Code, data and method live at [github.com/sztlink/dit-score](https://github.com/sztlink/dit-score). The LLM side of this practice lives at [kv-score](https://github.com/sztlink/kv-score).

![The reference fox](/img/lab/fox-bf16-ref.png)

*The reference fox. BF16, seed 1000, one of the 96 pairs behind each number above.*
