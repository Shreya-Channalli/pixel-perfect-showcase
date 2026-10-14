import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/technology" });
  },
  head: () => ({
    meta: [
      { title: "SiloVerse — Technology Module" },
      { name: "description", content: "Explore Consilio's technology inventory inside SiloVerse." },
      { property: "og:title", content: "SiloVerse — Technology Module" },
      { property: "og:description", content: "Explore Consilio's technology inventory inside SiloVerse." },
    ],
  }),
});
