import { MongoClient } from "mongodb";

// Sample smoothie items inspired by real smoothie offerings
export const smoothieItems = [
  {
    id: "smoothie-1",
    name: "Tropical Paradise",
    description: "A refreshing blend of pineapple, mango, banana, and coconut water. Perfect for a sunny day!",
    basePrice: 8.99,
    category: "fruit",
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop",
    ingredients: ["Pineapple", "Mango", "Banana", "Coconut Water", "Ice"],
    healthBenefits: ["Vitamin C", "Immune Support", "Hydrating"],
    isAvailable: true,
    isFeatured: true,
    allergens: [],
    nutritionInfo: {
      calories: 180,
      protein: 2,
      carbs: 45,
      fat: 0.5
    }
  },
  {
    id: "smoothie-2",
    name: "Berry Blast",
    description: "Antioxidant-rich blend of strawberries, blueberries, raspberries, and açai with almond milk.",
    basePrice: 9.49,
    category: "berry",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop",
    ingredients: ["Strawberries", "Blueberries", "Raspberries", "Açai", "Almond Milk"],
    healthBenefits: ["Antioxidants", "Heart Health", "Anti-Inflammatory"],
    isAvailable: true,
    isFeatured: true,
    allergens: ["tree nuts"],
    nutritionInfo: {
      calories: 210,
      protein: 4,
      carbs: 38,
      fat: 5
    }
  },
  {
    id: "smoothie-3",
    name: "Green Power",
    description: "Nutrient-packed with spinach, kale, green apple, cucumber, and ginger. Energy in a glass!",
    basePrice: 9.99,
    category: "green",
    image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=400&fit=crop",
    ingredients: ["Spinach", "Kale", "Green Apple", "Cucumber", "Ginger", "Lemon"],
    healthBenefits: ["Detoxifying", "Energy Boost", "Alkalizing"],
    isAvailable: true,
    isFeatured: false,
    allergens: [],
    nutritionInfo: {
      calories: 145,
      protein: 3,
      carbs: 32,
      fat: 1
    }
  },
  {
    id: "smoothie-4",
    name: "Chocolate Peanut Butter",
    description: "Indulgent yet healthy! Cacao, peanut butter, banana, and oat milk create a creamy delight.",
    basePrice: 10.49,
    category: "protein",
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop",
    ingredients: ["Cacao", "Peanut Butter", "Banana", "Oat Milk", "Honey", "Vanilla"],
    healthBenefits: ["Protein Rich", "Energy", "Muscle Recovery"],
    isAvailable: true,
    isFeatured: true,
    allergens: ["peanuts"],
    nutritionInfo: {
      calories: 320,
      protein: 12,
      carbs: 42,
      fat: 14
    }
  },
  {
    id: "smoothie-5",
    name: "Mango Lassi",
    description: "Traditional Indian-inspired smoothie with mango, yogurt, cardamom, and a hint of rose water.",
    basePrice: 8.49,
    category: "fruit",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",
    ingredients: ["Mango", "Greek Yogurt", "Cardamom", "Rose Water", "Honey"],
    healthBenefits: ["Probiotics", "Digestive Health", "Vitamin A"],
    isAvailable: true,
    isFeatured: false,
    allergens: ["dairy"],
    nutritionInfo: {
      calories: 195,
      protein: 8,
      carbs: 35,
      fat: 3
    }
  },
  {
    id: "smoothie-6",
    name: "Matcha Energizer",
    description: "Green tea matcha powder with banana, spinach, and coconut milk for sustained energy.",
    basePrice: 9.99,
    category: "green",
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop",
    ingredients: ["Matcha Powder", "Banana", "Spinach", "Coconut Milk", "Honey"],
    healthBenefits: ["Sustained Energy", "Focus", "Antioxidants"],
    isAvailable: true,
    isFeatured: false,
    allergens: [],
    nutritionInfo: {
      calories: 220,
      protein: 5,
      carbs: 36,
      fat: 7
    }
  },
  {
    id: "smoothie-7",
    name: "Strawberry Banana Classic",
    description: "The timeless favorite! Fresh strawberries and ripe banana blended with vanilla yogurt.",
    basePrice: 7.99,
    category: "berry",
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop",
    ingredients: ["Strawberries", "Banana", "Vanilla Yogurt", "Honey"],
    healthBenefits: ["Vitamin C", "Potassium", "Probiotics"],
    isAvailable: true,
    isFeatured: true,
    allergens: ["dairy"],
    nutritionInfo: {
      calories: 185,
      protein: 6,
      carbs: 38,
      fat: 2
    }
  },
  {
    id: "smoothie-8",
    name: "Avocado Dream",
    description: "Creamy avocado with spinach, lime, pineapple, and coconut water. Silky smooth perfection!",
    basePrice: 10.99,
    category: "green",
    image: "https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400&h=400&fit=crop",
    ingredients: ["Avocado", "Spinach", "Lime", "Pineapple", "Coconut Water"],
    healthBenefits: ["Healthy Fats", "Heart Health", "Vitamin K"],
    isAvailable: false, // Marked as sold out
    isFeatured: false,
    allergens: [],
    nutritionInfo: {
      calories: 280,
      protein: 4,
      carbs: 32,
      fat: 18
    }
  }
];

export async function seedMenuItems() {
  const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/smoothie_db";
  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    const db = client.db();
    const menuItemsCol = db.collection("menu_items");

    // Clear existing items
    await menuItemsCol.deleteMany({});

    // Insert new items
    await menuItemsCol.insertMany(smoothieItems);

    console.log(`✅ Seeded ${smoothieItems.length} menu items`);
  } finally {
    await client.close();
  }
}

// Don't auto-run - only run when explicitly called
// Run if called directly
// const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
//                      import.meta.url.endsWith(process.argv[1]);

// if (isMainModule) {
//   seedMenuItems()
//     .then(() => {
//       console.log("Menu items seeding complete!");
//       process.exit(0);
//     })
//     .catch((err) => {
//       console.error("Error seeding menu items:", err);
//       process.exit(1);
//     });
// }

