export async function POST(request) {
  try {
    const { prompt, apiKey } = await request.json();

    if (!apiKey) {
      return Response.json({ error: "API key gerekli" }, { status: 400 });
    }

    const submitRes = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: "landscape_16_9",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: false,
      }),
    });

    if (!submitRes.ok) {
      const text = await submitRes.text();
      return Response.json({ error: `fal.ai hatası: ${text.slice(0, 200)}` }, { status: submitRes.status });
    }

    const { request_id } = await submitRes.json();

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const pollRes = await fetch(
        `https://queue.fal.run/fal-ai/flux/schnell/requests/${request_id}`,
        { headers: { "Authorization": `Key ${apiKey}` } }
      );

      if (!pollRes.ok) continue;

      const data = await pollRes.json();

      if (data.status === "COMPLETED") {
        const url = data.images?.[0]?.url;
        if (!url) return Response.json({ error: "Görüntü URL'si alınamadı" }, { status: 500 });
        return Response.json({ url });
      }

      if (data.status === "FAILED") {
        return Response.json({ error: "Görüntü üretimi başarısız" }, { status: 500 });
      }
    }

    return Response.json({ error: "Timeout" }, { status: 408 });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
