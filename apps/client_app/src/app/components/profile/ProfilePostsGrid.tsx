"use client";

const posts = [
  { id: 1, image: "/post1.jpg" },
  { id: 2, image: "/post2.jpg" },
];

export default function ProfilePostsGrid() {
  return (
    <div className="grid grid-cols-3 gap-0.5 bg-gray-200">
      {posts.map((post) => (
        <div key={post.id} className="aspect-square bg-gray-100">
          <img
            src={post.image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
