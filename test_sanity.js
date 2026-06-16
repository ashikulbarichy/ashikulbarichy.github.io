import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const client = createClient({
  projectId: 'eu7fw3iy',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: 'skMmYoaL9hv4BGkJXyy4rjLZMTIzSZEHeI94AXTDGkDjxPF7wcLzycNr8wgfOAUQMrUpTZymUXvzgq7JgNGMnnkIYMIL373o1s3H7kvJvS6I3cBTPKMwRaBxpSEhHagEShfacBa8IL9ZulOBVmKC9QNJCxiBhztygwKdVqj7MGMvCbxTfTvs',
  useCdn: true,
});

const builder = imageUrlBuilder(client);

function urlFor(source) {
  if (!builder || !source) return '';
  return builder.image(source).url();
}

async function run() {
  const query = `*[_type == "landingPage" || _type == "hero"] | order(_type desc)[0] {
    heroName,
    heroRole,
    heroSubtitle,
    heroLocation,
    profilePic,
    cvUrl,
    certifications,
    skills
  }`;
  
  try {
    const data = await client.fetch(query);
    console.log("Fetched Data:", JSON.stringify(data, null, 2));
    if (data && data.profilePic) {
      console.log("Resolved Image URL:", urlFor(data.profilePic));
    } else {
      console.log("No profilePic found in data.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
