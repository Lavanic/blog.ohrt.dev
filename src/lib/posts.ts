import { getCollection, type CollectionEntry } from "astro:content";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// newest first; drafts stay visible in `astro dev` but never ship
export async function getPosts() {
  const posts = await getCollection("posts", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// frontmatter dates parse as UTC midnight, so read them in UTC
export function postParams(post: CollectionEntry<"posts">) {
  const { date } = post.data;
  return {
    year: String(date.getUTCFullYear()),
    month: MONTHS[date.getUTCMonth()],
    day: String(date.getUTCDate()),
    slug: post.id,
  };
}

export function postUrl(post: CollectionEntry<"posts">) {
  const { year, month, day, slug } = postParams(post);
  return `/${year}/${month}/${day}/${slug}/`;
}
