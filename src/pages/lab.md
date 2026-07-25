---
layout: ../layouts/Escrito.astro
title: "lab"
subtitle: "From KV caches to gallery walls"
date: "2026–present"
description: "Research notes on low-level inference for image and video models. CUDA kernels, quantization, fidelity benchmarks, and the installations that run on them."
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

I quantized the Turbo checkpoint to W4A4 with the SVDQuant method, calibrated on a rented H100, and scored the result on the same 4090 and the same 96 seed-locked pairs as Study 1. The perceptual distance reads 0.268, near where the four-step build sits, which says the sampling trajectory moves to a neighboring image. The reward model moved the other way. ImageReward came in at plus 0.052, the highest reading in the whole study, storage or fused. I do not read that as four bits beating full precision, and I want to be careful here because the easy reading is wrong. A reward model is a learned taste with known failure modes, and the likelier story is that quantization nudged the trajectory into a more prototypical basin, nearer the kind of image that model was trained to favor. What the number supports is narrower and more useful. Quality did not degrade. Four bits of weight and four bits of activation, and the cost does not show up as a penalty this measure can see, which is the opposite of what cutting steps does.

The reason it holds is the shape of the method. SVDQuant carries a small full-precision side branch next to the four-bit multiply, and that branch absorbs the handful of large activations that would otherwise wreck the last blocks of the transformer. I watched the calibration error climb block by block, roughly three times larger at the end than at the start, and the branch soaked it up. The collapse I expected in the final layers never reached the image. What remains is a build that shifts its compositions slightly and keeps its quality, and that is the only kind of quantization that turns into frames on a gallery wall.

The measured checkpoint is the artifact. The next step is running it through a fused kernel on my own cards, and after that, spending the four-bit budget where the model actually needs it instead of flat across every block.

## Study 4. The four-bit build runs in a fused runtime

Study 3 ended with a checkpoint and a promise, to run it through a fused kernel on my own cards. This study keeps the promise. I ported Krea 2 into the Nunchaku runtime, which carries custom kernels for four-bit weights and activations, and ran the checkpoint through them. It is the first time Krea 2 has generated an image with four-bit weights and activations through fused low-bit kernels instead of a simulation of them.

It generates correct images. I ran the same twelve prompts and eight seeds as the earlier studies against the full-precision model on the same card, ninety six pairs per resolution. At 1024 pixels the perceptual distance averages 0.276 and the reward model reads plus 0.078, at 512 pixels it averages 0.226 and the reward reads flat. Quality did not degrade, it moved a touch the other way, and at the smaller size it holds even closer. The number at 1024 lands almost exactly on what Study 3 predicted from simulation, which is the best evidence that the running build is faithful to the calibration it came from. The prompts that move the most shift their composition, they do not lose quality, the same behavior the whole benchmark keeps finding.

On speed, measured on an L40S with warm medians and both models on the same attention path, the four-bit build renders a 1024 pixel image in 5.4 seconds against 7.7 for full precision, and a 512 pixel image in 1.34 against 2.19. At 512 pixels and two steps it reaches about two and a half images a second. The gain from four bits is 1.44 to 1.63 times, and it grows as the picture shrinks because attention takes less of the work and the quantized matmuls take more.

A separate factor of three sat on top of all of that, and finding it honestly took two tries. The first port ran four times slower, with attention stuck in the slow fallback path. Krea 2 splits its attention heads in the grouped way, and the obvious way to write that is a single flag on the attention call. Krea 2 also always passes a mask, because text and image share one sequence. The fast kernel refuses to serve those two together and drops to the slow path without a word. Expanding the heads by hand instead lets the fast kernel run with the mask still there. I got this wrong in between. I tested the attention call on its own, saw the flag behave fine, and rewrote the explanation around a data type instead. That isolated test had no mask, so it never met the condition that mattered. Only the test inside the real pipeline settled it. The failure generalizes past this model. Any model that splits heads that way and also masks will lose the fast kernel silently.

The four-bit build runs now, and it runs faster. The remaining distance to real time runs through folding more of the work into single kernels, spending the four-bit budget where the model needs it instead of flat across every block, and the cards I actually own.

## Study 5. The practice moves to video, and one day on one 4090

In July Krea released Krea Realtime 14B, an autoregressive video model distilled from Wan 2.1 with Self-Forcing, open weights. It generates video the way a language model decodes text, in blocks of three latent frames with a literal KV cache per transformer layer, which makes it the meeting point of everything above. The KV-cache techniques from my LLM year apply directly, and what comes out is moving image. I rented an H100 for an afternoon and measured the floor. The claimed configuration reaches 5.71 fps at 832x480 with 4 denoising steps, the stability mechanism rebuilds the whole cache every block at a cost that grows linearly with the context window, and the full 21-frame window peaks at 93.2 GB, measured on an H200 because the H100 ran out of memory first. The release also keeps 6.6 GB of duplicate projection weights alive after fusing them, and its text encoder builds itself in full precision directly on the GPU, 22.7 GB before any video model loads, so the release cannot even initialize on a 24 GB card. Both walls carry fixes in the bench repo now, and the three-line patch for the first one measures bit identical on the small model.

The expensive lesson from the Krea 2 work was that debugging a quantization pipeline at cloud prices burns money to learn what a small model teaches for free. Wan 2.1 has a 1.3 billion parameter sibling with the same architecture and the same causal loop, and it fits my 4090. The proxy turned out faithful where it matters. Its cache-rebuild curve reproduces the shape of the 14B's, and the global window that kills an 80 GB H100 at full scale runs on a 24 GB card at 2.88 fps with an allocator flag. So the whole pipeline got built and proven there, in one day, at zero cloud cost.

The pipeline is SVDQuant again, four bits of weight and four bits of activation, and the hard part was feeding it. Standard PTQ collectors cache the transformer's inputs per step and replay the model later, and a causal server carries gigabytes of mutable cache state inside those very inputs, so replay is not an option. The collector I wrote inverts the flow. It captures each linear projection's input during real generation, denoising steps and cache rebuilds both, tagged by timestep, and 48 seconds of generation covers the full schedule. Calibration over those captures took 163 seconds for all thirty blocks on the 4090, the kernel packer accepted every tensor on the first try, and the quantized blocks weigh 0.74 GB against 2.6 in bf16. The runtime port swaps only the calibrated projections for the fused four-bit kernels and leaves attention, RoPE and the server loop untouched. Same card, same resolution, same steps, the four-bit model runs at 8.8 fps where full precision gives 7.5, and at 4.8 fps on the global window where full precision gives 2.88, because the cache rebuild is matmul-heavy and that is exactly what the fused kernels accelerate.

![Last frame of the four-bit global window run](/img/lab/w4a4-global-window-last.jpg)

*The last frame of the global window run. The 21 frame window that outgrows an 80 GB H100 at 14B scale, here running in four bits on the 4090 at 4.8 fps, 832x480, 4 steps, seed 42.*

Then the ruler, and the measurement I did not expect to be the important one. I wanted to judge the four-bit model by its distance to the full-precision trajectory, and the first version of that ruler failed it. Before trusting the verdict I measured the ruler itself. A perturbation of one part in a thousand, injected once into a single forward pass of the pure bf16 model, does not survive the arithmetic, because bf16 resolves about 0.4 percent per element and rounds the perturbation away. One part in a hundred, injected once, grows 48.7 times over 27 autoregressive frames and heads toward the distance between two different seeds. The sampler is chaotic, no sustained per-step error can hold a trajectory close, including the rounding of bf16 itself, and a ruler that demands trajectory closeness fails every build that will ever exist. So the ruler asks different questions. The four-bit model's divergence stays below the distance between two valid videos of the same prompt across the whole clip, its cross-seed diversity matches full precision at a ratio of 0.89, its latent statistics track within ten percent, and a double-length run of 54 latent frames drifts no faster than full precision drifts on its own. The quantized model makes a different video of the same prompt, with the same stability and the same statistics, faster than the model it came from.

![bf16 and four-bit runs side by side across time](/img/lab/strip-video-bf16-w4a4.jpg)

*Same prompt, seed 42, same card, all rows 832x480 at 4 steps, columns aligned by frame index. The bf16 reference and the four-bit build both end at frame 101, the double-length four-bit run continues to frame 203 and ends coherent. The two four-bit rows share the seed and still differ, because the fused kernels are nondeterministic across runs and the sampler amplifies that like any other perturbation.*

The A100 pass ran the same evening. Collecting activations from the 14B took 8 minutes, calibrating all 40 blocks took 22.5 minutes, and the small model's error map predicted the big one stream by stream, with the attention input median matching to three decimals. The whole rented pass cost about three dollars and sixty cents. Then the checkpoint came home and the first run on the 4090 missed by 442 megabytes, because the cross attention projections the calibration had skipped weigh 4.2 GB at 14B scale. They got quantized on the 4090 itself, in 130 seconds, from the calibration data the cloud pass had left behind, and with that the gate opened. Krea Realtime 14B generates video on one RTX 4090 at 2.81 fps, 832x480, 4 steps, peaking at 22.8 of the card's 24 GB, three seeds giving three distinct videos, finite all the way. Half the speed of an H100 running the model in bf16, from a card that cannot load the bf16 model at all. The full receipts, scripts and raw numbers live in [krea-realtime-bench](https://github.com/sztlink/krea-realtime-bench).

## Study 6. The cache becomes the model, and an eye finds what no metric had

Quantizing the weights of the 14B moved the bottleneck rather than removing it. With the weights at four bits they occupy 8.23 GB on the card, and the KV cache beside them occupies 7.67 GB, which leaves 0.92 GB free at the operating point that opened the gate. The cache is now almost the size of the model. I went looking for speed first, because `torch.compile` costs nothing and needs no CUDA toolkit, and the answer was no. The frame splits into 83 percent transformer and 15.7 percent VAE decode, the transformer's quantized linears enter through a pybind extension rather than the torch dispatcher so dynamo breaks the graph at all 400 of them, and the decoder, measured alone with the real latents from the gate run, compiles to 1.31 times faster for 6.32 GB of extra peak, which works out to 3.7 percent end to end on a card with 0.92 GB free. The 6 and 12 frame windows fail inside cache allocation by 138 and 230 megabytes, short of memory rather than short of architecture.

So the cache went to four bits. It stores int4 packed two values per byte with one scale per token, per head, per rotary band, and it presents itself to the runtime as an ordinary tensor across the only three operations the server performs on it, a slice write, a rolling eviction, and a slice read. Nothing upstream had to be forked. Two design choices came out of measurement rather than taste. Rotary embedding splits the 128 channels of each head into three bands, 44 for time and 42 each for height and width, and a blind group of 64 straddles that boundary and puts one scale across channels that rotate in different regimes. Measured on real post-rotary keys from a live generation, the blind grouping costs 40 percent more error in the temporal band alone at layer 39, and error that tracks frame position is the worst kind to have in video. Subdividing inside the bands and never across them cuts the key error from 0.119 to 0.080 for 7 percent more bytes. Keys quantize harder than values by 11 percent, which matches what they do, since a key is an address and a value is content.

The first implementation was written to be correct and it cost 20 to 31 percent of the frame in format conversion, so it got two fused Triton kernels, one program per token and head, unpacking and scaling in a single pass. Read throughput improved by a factor of 10 to 13 and the output is bit identical to the reference. The number that mattered was a different one. Dequantization time went flat in the number of groups, 0.188 milliseconds against 0.174 against 0.176 for three, six and twelve groups per head, so the finest grouping became free on the path that dominates. Conversion fell to between 1.3 and 2.6 percent of the frame. The cache now weighs 2.097 GB where it weighed 7.668, and the model generates on the same card at 2.96 fps with a peak of 19.02 GB, faster and smaller than the bf16 cache it replaced. The 6 frame window runs for the first time. So does the 12 frame window, four times the context of the gate, which in bf16 would need 19.2 GB for the cache alone.

Then Felipe watched the clips and found something none of my instruments had. Two short moments in the twelve frame clip where everything goes slightly grey and recovers, one in the six frame clip. Every metric I had been running said the clips were fine. Finite latents, stable magnitudes, an identity retention curve that turned out to be tracking camera motion. Measuring frame contrast located the events exactly where he said they were, and his description of the mechanism turned out to be the mechanism. Mixing modelling clay of every colour gives grey, because an average of many different things tends toward the middle. Attention does this literally. When the distribution spreads instead of selecting, the output is a mean over many values, and a mean of diverse states has low variance, which is what low contrast is. Probing the attention distribution per block confirms it. In the resident regime the mean maximum attention weight correlates with frame contrast at 0.79 and the entropy at minus 0.77, and in the recompute regime both signals sit flat within a fifth of the range and no grey appears. Krea's cache rebuild works because it derives every key from one clean context at timestep zero, which leaves the keys homogeneous and comparable, and a query can elect one.

That suggested an obvious instrument, a reset that fires when the mixture starts turning grey instead of every fixed number of blocks, and it failed. The sensor costs about 2 percent of the frame and predicts the collapse, but the gate fires once in eighteen blocks and lands where the resident regime already was. The reason is worth more than the feature. I had treated homogeneity as a state that gets repaired when it breaks, and it behaves as a continuous property that survives only by never being allowed to form otherwise. By the time a sensor reports, the damage sits in the cache, and one cleanup buys a single block before the accumulation resumes.

What replaces the sensor is a curve. On the 12 frame window across four seeds, never rebuilding gives 28 to 35 degraded frames out of 210 in every single seed and a contrast collapse of 37.6 percent, while rebuilding every block, every second block and every fourth block all give zero. Every fourth block runs at 1.99 fps against 1.45 for every block, so the operating point is 37 percent faster than the released behaviour with nothing visible given up. The last comparison inverted what I expected. Under a finite rebuild period the 12 frame window is more stable than the 6 frame window, zero degraded frames against seven, because the clean context that gets rebuilt each time carries eleven frames of history instead of five, and attention has more homogeneous material to elect from. The long window buys stability, and it only reads as a cost when the rebuild is removed.

![Twelve frames of context, rebuilt every fourth block](/img/lab/kv12-n4-strip.jpg)

*Krea Realtime 14B on one RTX 4090, four bit weights and a four bit KV cache, 12 frames of context, cache rebuilt every fourth block. 832x480, 4 steps, seed 42, 1.99 fps, 18 blocks of generation. The full curve, the failed sensor and the raw numbers live in [krea-realtime-bench](https://github.com/sztlink/krea-realtime-bench).*

## Where this goes

The image stack generates a 1024px image in 5.5 seconds on the 4090, measured warm, 8 steps, fp8. The video stack now runs the 14B at 2.96 fps on three frames of context and 1.99 fps on twelve, both at 832x480 with four bit weights and a four bit cache on the same card. Real time for an installation means closing the distance between those numbers and the speed of presence, and two of the three roads I named a week ago have been walked, the fused kernels and the quantized cache. What is left is fidelity gates that catch what an eye catches, which is the part this study made concrete by failing at it. The harnesses that produced the tables above are the gates. They are open source, and the numbers they produce are the kind I would want to read from anyone else.

Code, data and method live in [Dead Channel](https://github.com/sztlink/dead-channel), an open benchmark that measures where diffusion quantization tunes to static, with the leaderboard at [huggingface.co/spaces/felipesztutman/dead-channel](https://huggingface.co/spaces/felipesztutman/dead-channel). The video side lives in [krea-realtime-bench](https://github.com/sztlink/krea-realtime-bench). The LLM side of this practice lives at [kv-score](https://github.com/sztlink/kv-score).

![The reference fox](/img/lab/fox-bf16-ref.png)

*The reference fox. BF16, seed 1000, one of the 96 pairs behind each number above.*
