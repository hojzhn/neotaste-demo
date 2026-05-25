// Filler reviews per restaurant — drives the Reviews section of the
// RestaurantDetailPage. Each reviewer carries inline display info (no
// reference into users.js, so reviewers don't accidentally surface in the
// friend picker).
export const reviews = [
  {
    id: "r-pp-1",
    restaurantId: "peter-pane",
    reviewer: { name: "Johanna", initials: "J", avatarColor: "#fa6f6f" },
    rating: 5,
    text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.",
    daysAgo: 21,
    photos: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&auto=format&fit=crop",
    ],
    likes: 16,
  },
  {
    id: "r-pp-2",
    restaurantId: "peter-pane",
    reviewer: { name: "Tung Anh", initials: "T", avatarColor: "#bafad4" },
    rating: 2,
    text: "War super lecker.",
    daysAgo: 7,
    photos: [],
    likes: 4,
  },
  {
    id: "r-pp-3",
    restaurantId: "peter-pane",
    reviewer: { name: "Mia", initials: "M", avatarColor: "#ffc86a" },
    rating: 4,
    text: "Solid spot. The 1€ cookie deal is unbeatable. Fresh-baked, perfect with a coffee on a Sunday afternoon.",
    daysAgo: 14,
    photos: [
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop",
    ],
    likes: 9,
  },
  {
    id: "r-spot-1",
    restaurantId: "the-spot",
    reviewer: { name: "Jan", initials: "J", avatarColor: "#53f293" },
    rating: 5,
    text: "The 6-course menu blew my mind. Each course was thoughtful and beautifully plated. Well worth the upgrade.",
    daysAgo: 3,
    photos: [],
    likes: 28,
  },
  {
    id: "r-spot-2",
    restaurantId: "the-spot",
    reviewer: { name: "Karim", initials: "K", avatarColor: "#24afff" },
    rating: 4,
    text: "Lovely atmosphere on a weekday evening. Service was attentive without being intrusive.",
    daysAgo: 12,
    photos: [],
    likes: 7,
  },
  {
    id: "r-camping-1",
    restaurantId: "camping-coffee",
    reviewer: { name: "Lena", initials: "L", avatarColor: "#24afff" },
    rating: 5,
    text: "My new favorite brunch spot. Bowls are huge, coffee is excellent, and the staff genuinely seems happy to be there.",
    daysAgo: 10,
    photos: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop",
    ],
    likes: 12,
  },
  {
    id: "r-otto-1",
    restaurantId: "ottos-burger",
    reviewer: { name: "Max", initials: "M", avatarColor: "#fff592" },
    rating: 4,
    text: "Best burgers in Schanze. Fries were a touch cold today but the patty was perfect.",
    daysAgo: 5,
    photos: [],
    likes: 7,
  },
  {
    id: "r-otto-2",
    restaurantId: "ottos-burger",
    reviewer: { name: "Sara", initials: "S", avatarColor: "#ecbb06" },
    rating: 5,
    text: 'The "free side with any burger" deal is unreal value. I went for the sweet potato fries and no regrets!!',
    daysAgo: 1,
    photos: [],
    likes: 3,
  },
];

export const reviewsByRestaurantId = reviews.reduce((acc, r) => {
  if (!acc[r.restaurantId]) acc[r.restaurantId] = [];
  acc[r.restaurantId].push(r);
  return acc;
}, {});
