import { hash } from "@node-rs/argon2";
import { db } from "./client";
import { users, profiles, links } from "./schema";

const DEMO_PASSWORD = "password123";

const DEMO_USERS = [
  {
    email: "kiki@example.com",
    username: "kiki",
    displayName: "Kiki Amelia",
    bio: "Content creator & digital artist ✦",
    themeColor: "#7c3aed",
    isVerified: true,
    socials: { instagram: "kiki.art", tiktok: "kiki.art" },
    links: [
      { title: "Latest YouTube Video", url: "https://youtube.com/@kiki", isFeatured: true },
      { title: "Shop My Merch", url: "https://kiki.shop" },
      { title: "Instagram", url: "https://instagram.com/kiki.art" },
    ],
  },
  {
    email: "budi@example.com",
    username: "budi",
    displayName: "Budi Santoso",
    bio: "Full-stack developer. Building in public.",
    themeColor: "#0ea5e9",
    isVerified: false,
    socials: { github: "budisantoso", twitter: "budidev" },
    links: [
      { title: "Portfolio", url: "https://budisantoso.dev", isFeatured: true },
      { title: "GitHub", url: "https://github.com/budisantoso" },
      { title: "Hire Me", url: "https://budisantoso.dev/contact" },
    ],
  },
  {
    email: "sari@example.com",
    username: "sari",
    displayName: "Sari Wijaya",
    bio: "Coach nutrisi bersertifikat 🥗",
    themeColor: "#f97316",
    isVerified: false,
    socials: { instagram: "sari.nutrition" },
    links: [
      { title: "Booking Konsultasi", url: "https://cal.com/sariwijaya", isFeatured: true },
      { title: "E-book Gratis", url: "https://sariwijaya.com/ebook" },
      { title: "Instagram", url: "https://instagram.com/sari.nutrition" },
    ],
  },
];

async function main() {
  const passwordHash = await hash(DEMO_PASSWORD);

  for (const demo of DEMO_USERS) {
    const [user] = await db
      .insert(users)
      .values({ email: demo.email, passwordHash })
      .returning();
    if (!user) throw new Error(`Failed to insert user ${demo.email}`);

    const [profile] = await db
      .insert(profiles)
      .values({
        userId: user.id,
        username: demo.username,
        displayName: demo.displayName,
        bio: demo.bio,
        themeColor: demo.themeColor,
        isVerified: demo.isVerified,
        socials: demo.socials,
      })
      .returning();
    if (!profile) throw new Error(`Failed to insert profile ${demo.username}`);

    await db.insert(links).values(
      demo.links.map((link, index) => ({
        profileId: profile.id,
        title: link.title,
        url: link.url,
        isFeatured: link.isFeatured ?? false,
        sortOrder: index,
      }))
    );

    console.log(`Seeded @${demo.username}`);
  }

  console.log(`\nDemo password for all seeded users: ${DEMO_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
