/**
 * Mess menus, bundled exactly as Campus App bundles them (lib/mess_menu_json.dart)
 * - the menu is published weekly by the hostels, not served by the API.
 *
 * Shape: data[0][weekday][meal] = comma-separated dishes.
 */


/// Weekly menu for Sannasi / Agasthiyar / D-Mess.
const SANNASI_MENU = {
  'data': [
    {
      'monday': {
        'Breakfast':
            'Bread, Butter, Jam, Ghee Pongal, Sambar, Coconut Chutney, Vadai, Tea / Coffee / Milk / Boiled Egg ( 1 Piece ), Millet Chappathi, Aloo Channa',
        'Lunch':
            'Payasam, Ghee Chappathi, Palak Panneer, Variety Rice, Steamed Rice, Sambar, Dal Lasooni, Tomato Rasam, Gobi-65 Or Bitter Guard - 65, Raw Banana Chops, Special Fryums, Butter Milk, Pickle',
        'Snacks': 'Pav Bajji, Tea / Coffee',
        'Dinner':
            'Poori, Potato Masala, Idly, Idly Podi, Oil, Special Chutney, Steamed Rice, Chilli Sambar, Jeera Dal, Rasam, Aloo Capsicum, Pickle, Fryums, Veg - Salad, Banana, Dry Fish Gravy',
      },
      'tuesday': {
        'Breakfast':
            'Bread, Butter, Jam, Dosa, Sambar, Chutney, Idly Podi, Oil, Poha, Mint Chutney, Masala Omlet, Tea / Coffee / Milk',
        'Lunch':
            'Millet Sweet, Palak Poori, Kashmiri Dum Aloo, Jeera Pulao, Steamed Rice, Masala Sambar, Bagara Dal, Mix Veg Usili, Pepper Rasam, Lauki Subji, Pickle, Butter Milk, Fryums',
        'Snacks': 'Boiled Peanut / Black Channa Sundal, Tea / Coffee',
        'Dinner':
            'Millet Chappathi, Aloo Chenna Khurma, Fried Rice / Noodles / Pastha, Manchurian Gravy / Crispy Vegetable, Steamed Rice, Rasam, Dal Fry, Pickle, FryumsVeg-Salad, Milk, Spl Fruits, Mutton Gravy',
      },
      'wednesday': {
        'Breakfast':
            'Bread, Butter, Jam, Idly, Veg Kosthu, Spl Chutney, Chappathi, Veg Khorma, Tea / Coffee / Milk',
        'Lunch':
            'Millet Chappathi, Soya Kasa, Sultani Pulao, Steamed Rice, Mysore Dal Fry, Kadi Pakoda, Garlic Rasam, Aloo Palak (or) Aloo Paruval, Yam Mochai Roast, Pickle, Fryums, Butter Milk',
        'Snacks': 'Veg Puff / Sweet Bun, Tea/Coffee',
        'Dinner':
            'Chappathi, Steamed Rice, Dal Tadka, Chicken Masala / Chilli Chicken (Non-Veg) / Panneer Butter Masala, Rasam, Pickle, FryumsVeg Salad, Milk, Banana, Chicken Gravy',
      },
      'thursday': {
        'Breakfast':
            'Bread, Butter, Jam, Chappathi Dal Aloo, Veg Semiya Kichadi, Coconut Chutney, Boiled Egg ( 1 Piece ), Banana, Tea / Coffee / Milk',
        'Lunch':
            'Chappathi, Aloo Mutar Panneer Masala, Bahara Pulao, Punjabi Dal Tadka, Kadai Vegetable, Steamed Rice, Drumstick Brinjal Sambar, Pineapple Rasam, Beetroot Poriyal Pickle, Fryums, Butter Milk',
        'Snacks': 'Pani Poori (or) Mixture / Tea / Coffee',
        'Dinner':
            'Varity Dosa (Sambar, varity Chuntney), Malabar Paratha, Mixed Veg Kuruma, Steamed Rice, Chole Dal Fry, Rasam, Aloo Peanut Masala, Fryums, Pickle, Veg Salad, Milk, Ice Cream, Chicken Gravy',
      },
      'friday': {
        'Breakfast':
            'Bread, Butter, Jam, Idly, Vadacurry, Idly Podi, Oil, Ghee Chappathi, Aloo Rajma, Boiled Egg ( 1 Piece ), Tea / Coffee / Milk',
        'Lunch':
            'Spl Dry Jamun / Bread Halwa, Veg Briyani, Mix Raitha, Bisebelabath, Curd Rice, Steamed Rice, Tomato Rasam, Aloo Gobi subji, Moongdal Tadka, Pickle, Potato Chips',
        'Snacks': 'Bonda / Sambar Vada, Chutney, Tea / Coffee',
        'Dinner':
            'Chole Bhatura, Steamed Rice, Tomato Dal, Veg Upma, Coconut Chutney, Rasam, Cabbage Thoran, Pickle, Fryums, Veg Salad, Milk, Banana, Veg Soup, Mutton Gravy',
      },
      'saturday': {
        'Breakfast':
            'Bread, Butter, Jam, Chappathi, Aloo Meal Maker Kasa, Idiyappam (Lemon or Masala or Coconut Milk), Coconut Chutney, Tea / Coffee / Milk, Boiled Egg ( 1 Piece )',
        'Lunch':
            'Butter Poori, Peas Masala, Veg Pulao, Steamed Rice, Dal Makhni, Bhindi Do Pyasa, Parupu Urundai Kuzhambu, Kootu, Jeera Rasam, Pickle, Special Fryums, Butter Milk',
        'Snacks': 'Cake (or) Browni, Tea / Coffee',
        'Dinner':
            'Sweet, Panjabi Paratha, Rajma Makan wala, French Fry, Steamed Rice, Mysore Dal Fry, Idly, Idly Podi, Oil, Chutney, Tiffen Sambar, Rasam, Pickle, Fryums, Veg Salad, Milk, Special Fruit, Fish Gravy',
      },
      'sunday': {
        'Breakfast':
            'Bread, Butter, Jam, Chole Poori, Veg Upma, Coconut Chutney, Tea / Coffee / Milk',
        'Lunch':
            'Chappathi, Chicken (Pepper / Kadai), Panneer Butter Masala (or) Kadai Panneer, Dal Dhadka, Mint Pulao, Steamed Rice, Garlic Rasam, Poriyal, Pickle, Fryums, Butter Milk, Chicken Gravy',
        'Snacks': 'Corn / Bajji, Chutney (OR) Juice, Tea / Coffee',
        'Dinner':
            'Variety Stuffing Paratha, Curd, Steamed Rice, Hara Moong Dal Tadka, Kathamba Sambar, Poriyal, Rasam, Pickle, Fryums, Veg Salad, Milk, Ice Cream, Chicken Gravy',
      },
    },
  ],
} as const;

/// Weekly menu for M Block / PF.
const PF_MENU = {
  'data': [
    {
      'monday': {
        'Breakfast':
            'Ven Pongal, Tifin Sambar, Coconut Chutney, Medu Vada, Masala Omelette / Whole Wheat Bread Omelette - 1 No, Whole Wheat Bread, Butter, Jam, Milk, Filter Coffee, Plain Tea, Banana',
        'Lunch':
            'Methi Chappathi, Black Channa Masala, Lemon Rice / Tamarind Rice, Dal Makhani, Steamed Rice, Arachivitta Sambar, Keerai Kootu, Lemon Rasam, Curd - 100 Ml, Paruppu Podi, Ghee, Oil, Frymes, Pickle, Buttermilk, Payasam',
        'Snacks':
            'Samosa / Veg Roll - 1 No, Milk, Rose Milk / Badam Milk, Tea, Whole Wheat Bread, Butter, Jam',
        'Dinner':
            'Bagara Pulao / Idli, Raita / Chutney, Chappathi, Panner Gravy / Baby Corn Gravy, Steamed Rice, Pumpkin Samabr, Dal Rasam, Buttermilk, Pickle, Green Salad, Milk, Andhra Chicken Curry - 120 Gm / (Flavored Gravy)',
      },
      'tuesday': {
        'Breakfast':
            'Veg Rava Kitchadi / Vegetable Upma, Vegetable Sambar, Redchilli Coconut Chutney, Poori, Aloo Masala, Boiled Egg - 1 No, Whole Wheat Bread, Butter, Jam, Milk, Filter Coffee, Plain Tea, Seasonal Fruits',
        'Lunch':
            'Chappathi, White Peas Curry, Jeera Pulao, Yellow Dal, Steamed Rice, Karakuzhambu / More Kuzhambu, Poriyal, Tomato Rasam, Curd - 100 Ml, Paruppu Podi, Ghee, Oil, Frymes, Pickle, Buttermilk',
        'Snacks':
            'Pani Puri - 5 Nos / Pav Bhaji - 1 No, Milk, Filter Coffee, Ginger Tea, Whole Wheat Bread, Butter, Jam',
        'Dinner':
            'Onion Uthappam, Kara Chutney, Millet Chappathi, Dal Pancharathan, Idli Podi, Oil, Steamed Rice, Radish Sambar, Lemon Rasam, Buttermilk, Pickle, Green Salad, Milk, Egg Gravy (Flavored Gravy)',
      },
      'wednesday': {
        'Breakfast':
            'Idiyappam, Vada Curry / Veg Stew, Poha, Mint Chutney, Whole Wheat Bread, Butter, Jam, Milk, Filter Coffee, Plain Tea, Banana',
        'Lunch':
            'Beetroot Chappathi, Rajma Masala, Sambar Rice / Tomato Rice, Dal Fry, Steamed Rice, Urulai Kara Curry, Garlic Rasam, Curd Rice, Paruppu Podi, Ghee, Oil, Appalam, Pickle, Buttermilk',
        'Snacks':
            'Cream Bun - 1 No / Osmania Biscuits - 2 Nos, Milk, Filter Coffee, Masala Tea, Whole Wheat Bread, Butter, Jam',
        'Dinner':
            'Kal Dosa, Tomato Chutney, Chappathi, Paneer Butter Masala, Steamed Rice, Masala Samabr, Pineapple Rasam, Buttermilk, Pickle, Green Salad, Milk, Chicken Curry With 120 Gm Chicken / Chicken Biryani With Boiled Egg - 1 No',
      },
      'thursday': {
        'Breakfast':
            'Idli, Udipi Sambar, Groundunt Chutney, Medu Vada, Corn Flakes, Idli Podi, Oil, Boiled Egg - 1 No, Whole Wheat Bread, Butter, Jam, Milk, Filter Coffee, Plain Tea, Banana',
        'Lunch':
            'Chappathi, Vegetable Sabji, Ghee Pulao, Tomato Dal Fry, Steamed Rice, Vathakuzhambu, Vegetable Kootu, Ginger Rasam, Curd - 100 Ml, Paruppu Podi, Ghee, Oil, Frymes, Pickle, Buttermilk, Bondhi',
        'Snacks':
            'Masala Sundal - 100 Ml, Milk, Filter Coffee, Cardmom Tea, Whole Wheat Bread, Butter, Jam',
        'Dinner':
            'Uthappam, Vegetable Chutney, Chole Poori (Atta), Channa Masala, Steamed Rice, Kathirikai Sambar, Tomato Rasam, Buttermilk, Pickle, Green Salad, Milk, Arun Choco Bar / Cone Ice Cream - 1 No, Chettinadu Mutton Kuzhambu (Flavored Gravy)',
      },
      'friday': {
        'Breakfast':
            'Kal Dosa, Tifin Sambar, Onion Tomato Chutney, Semiya Bath, Idli Podi, Oil, Omelette / Whole Wheat Bread Omelette - 1 No, Whole Wheat Bread, Butter, Jam, Milk, Filter Coffee, Plain Tea, Banana',
        'Lunch':
            'Chappathi, Aloo Palak, Peas Pulao, Dal Tadka, Steamed Rice, Sambar, Beetroot Poriyal, Puli Rasam, Curd - 100 Ml, Paruppu Podi, Ghee, Oil, Appalam, Pickle, Buttermilk',
        'Snacks':
            'Muruku - 2 Nos, Milk, Mint Lemon Juice, Tea, Whole Wheat Bread, Butter, Jam',
        'Dinner':
            'Pasta (Bechamel / Arrabbiata) / Veg Schezwan Fried Rice (Manchurian), Soup, Chappathi, Kadai Vegetables, Steamed Rice, Mix Veg Samabr, Pepper Rasam, Buttermilk, Pickle, Green Salad, Milk, Chicken Gravy (Flavored Gravy)',
      },
      'saturday': {
        'Breakfast':
            'Idli, Chinna Vengaya Sambar, Groundunt Chutney, Aloo Paratha, Curd - 100 Ml, Idli Podi, Oil, Boiled Egg - 1 No, Whole Wheat Bread, Butter, Jam, Milk, Filter Coffee, Plain Tea, Banana',
        'Lunch':
            'Chappathi, Meal Maker Kuruma, Vegetable Dum Biryani, Raitha, Steamed Rice, Keerai Kootu, Jeera Rasam, Curd Rice, Paruppu Podi, Ghee, Oil, Frymes, Pickle, Buttermilk, Gulabjamun / Badhusha',
        'Snacks':
            'Eggless Cake / Brownie - 1 No, Milk, Filter Coffee, Masala Tea, Whole Wheat Bread, Butter, Jam',
        'Dinner':
            'Kal Dosa, Chutney, Parotta, Veg Salna, Idli Podi, Oil, Steamed Rice, Karaikudi Sambar, Garlic Rasam, Buttermilk, Pickle, Green Salad, Milk, Chicken Gravy (Flavored Gravy)',
      },
      'sunday': {
        'Breakfast':
            'Chole Bhature, Chenna Masala, Kal Dosa, Coconut Chutney, Sambar, Idli Podi, Oil, Egg Kal Dosa - 1 No, Whole Wheat Bread, Butter, Jam, Milk, Filter Coffee, Plain Tea, Banana',
        'Lunch':
            'Chappathi, Chicken Curry With 120 Gm Chicken, Paneer Gravy, Steamed Rice, Chettinad Sambar, Beetroot Poriyal, Dal Rasam, Curd - 100 Ml, Paruppu Podi, Ghee, Oil, Frymes, Pickle, Buttermilk, Arun Cup Ice Cream - 1 No',
        'Snacks':
            'Channa Sundal (White / Black) - 100 Ml, Milk, Filter Coffee, Ginger Tea, Whole Wheat Bread, Butter, Jam',
        'Dinner':
            'Dal Kitchadi, Chappathi, Veg Kuruma, Poriyal, Steamed Rice, Kadamba Sambar, Rasam, Buttermilk, Pickle, Green Salad, Milk, Chicken Gravy (Flavored Gravy)',
      },
    },
  ],
} as const;

export type MessId = "sannasi" | "pf";
export type Meal = "Breakfast" | "Lunch" | "Snacks" | "Dinner";
export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface MessOption {
  id: MessId;
  name: string;
  menu: { data: readonly Partial<Record<Weekday, Partial<Record<Meal, string>>>>[] };
}

export const MESSES: readonly MessOption[] = [
  { id: "sannasi", name: "Sannasi / Agasthiyar / D-Mess", menu: SANNASI_MENU },
  { id: "pf", name: "M Block / PF", menu: PF_MENU },
];

export const MEALS: readonly Meal[] = ["Breakfast", "Lunch", "Snacks", "Dinner"];

export const WEEKDAYS: readonly Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/** Serving windows shown beside each meal. */
export const MEAL_TIMES: Record<Meal, string> = {
  Breakfast: "7:00 - 9:00 AM",
  Lunch: "11:30 AM - 1:30 PM",
  Snacks: "4:30 - 5:30 PM",
  Dinner: "7:30 - 9:00 PM",
};

/**
 * Which meal to show when, as minutes since midnight: before 9:00 breakfast,
 * before 14:00 lunch, before 18:00 snacks, then dinner - and from 21:00,
 * tomorrow's breakfast.
 */
export const MEAL_SWITCH_MINUTES = {
  lunch: 9 * 60,
  snacks: 14 * 60,
  dinner: 18 * 60,
  nextDayBreakfast: 21 * 60,
} as const;

/** IndexedDB key for the student's chosen mess. */
export const PREFERRED_MESS_KEY = "preferred-mess";
