import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const photoStem =
  "ultra-photorealistic portrait photograph, shot on a Sony A7 IV with an 85mm f/1.4 prime lens at f/1.8, sharp focus on eyes, shallow depth of field, soft natural lighting, realistic skin texture with visible natural pores, no heavy retouching, editorial magazine quality, looks like a real candid photograph of a real person, NOT AI generated, 4k, color-graded with subtle warm tones";

const negative =
  "Avoid: cartoon, illustration, painting, 3d render, cgi, anime, plastic skin, doll-like, uncanny valley, deformed face, asymmetric eyes, extra fingers, blurry, low quality, watermark, text, logo, signature, oversaturated, heavy makeup, instagram filter, AI face, generic stock photo.";

const variants = {
  A: {
    name: "warm-professional",
    promptCore:
      "a friendly approachable woman in her late 20s, gentle warm genuine smile showing slight teeth, soft hazel-brown eyes making direct eye contact with the camera, shoulder-length wavy chestnut-brown hair, wearing a soft lavender blouse, natural light office background with large window slightly out of focus, professional but warm",
  },
  B: {
    name: "approachable-techie",
    promptCore:
      "a friendly woman in her late 20s with a relaxed slight smile, warm light-brown eyes, shoulder-length wavy auburn hair, wearing a cozy soft lavender knit sweater over a simple white t-shirt, modern bright home-office workspace softly out of focus behind her with a plant and laptop visible, casual but put-together",
  },
  C: {
    name: "trustworthy-advisor",
    promptCore:
      "a confident composed woman in her early 30s with a calm reassuring closed-mouth smile, intelligent green-hazel eyes, shoulder-length straight dark-blonde hair, wearing a tailored soft lavender blazer over a cream blouse, clean minimal light-gray studio backdrop, classic professional headshot",
  },
  D: {
    name: "friendly-modern",
    promptCore:
      "a warm friendly woman in her late 20s with a happy natural smile, bright brown eyes, shoulder-length wavy brown hair tucked behind one ear, wearing a soft lavender turtleneck sweater, bright airy modern coworking cafe heavily blurred in the background, sunny golden-hour rim light catching her hair",
  },
};

async function generateOne(key, v) {
  const prompt = `${photoStem}. Subject: ${v.promptCore}. Centered head-and-shoulders headshot, square framing, suitable as a chat avatar. ${negative}`;
  try {
    const resp = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1,
    });
    const item = resp.data?.[0];
    const outPath = `attached_assets/iris_avatars/gptimage_${key}_${v.name}.png`;
    if (item?.b64_json) {
      await writeFile(outPath, Buffer.from(item.b64_json, "base64"));
    } else if (item?.url) {
      const r = await fetch(item.url);
      await writeFile(outPath, Buffer.from(await r.arrayBuffer()));
    } else {
      throw new Error("no b64_json or url in response");
    }
    return { variant: key, ok: true, path: outPath };
  } catch (e) {
    return { variant: key, ok: false, error: String(e?.message || e).slice(0, 400) };
  }
}

const results = await Promise.all(
  Object.entries(variants).map(([k, v]) => generateOne(k, v)),
);
console.log(JSON.stringify(results, null, 2));
