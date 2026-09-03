import type { House, Trait } from "../types/game";

export interface Student {
  id: string;
  name: string;
  house: House;
  year: number;
  traits: Trait[];
  favoriteSubjects: string[];
  friends: string[]; // ids
  rivals: string[]; // ids
  bio: string;
}

export const students: Student[] = [
  {
    id: "harry-potter",
    name: "Harry Potter",
    house: "Gryffindor",
    year: 3,
    traits: ["Brave", "Loyal", "Determined"],
    favoriteSubjects: ["Defense Against the Dark Arts"],
    friends: ["hermione-granger", "ron-weasley"],
    rivals: ["draco-malfoy"],
    bio: "Quiet until something matters, and then impossible to talk out of it.",
  },
  {
    id: "hermione-granger",
    name: "Hermione Granger",
    house: "Gryffindor",
    year: 3,
    traits: ["Clever", "Determined", "Loyal"],
    favoriteSubjects: ["Charms", "Transfiguration"],
    friends: ["harry-potter", "ron-weasley"],
    rivals: [],
    bio: "Reads ahead in every subject and still shows up to class early.",
  },
  {
    id: "ron-weasley",
    name: "Ron Weasley",
    house: "Gryffindor",
    year: 3,
    traits: ["Loyal", "Brave", "Kind"],
    favoriteSubjects: ["Care of Magical Creatures"],
    friends: ["harry-potter", "hermione-granger"],
    rivals: ["draco-malfoy"],
    bio: "Underestimates himself constantly, which is the only inaccurate thing about him.",
  },
  {
    id: "draco-malfoy",
    name: "Draco Malfoy",
    house: "Slytherin",
    year: 3,
    traits: ["Ambitious", "Clever"],
    favoriteSubjects: ["Potions"],
    friends: [],
    rivals: ["harry-potter", "ron-weasley"],
    bio: "Carries himself like the room owes him something. Sometimes it does.",
  },
  {
    id: "luna-lovegood",
    name: "Luna Lovegood",
    house: "Ravenclaw",
    year: 2,
    traits: ["Curious", "Kind", "Creative"],
    favoriteSubjects: ["Care of Magical Creatures", "Astronomy"],
    friends: [],
    rivals: [],
    bio: "Says exactly what she's thinking, which unsettles people more than it should.",
  },
  {
    id: "neville-longbottom",
    name: "Neville Longbottom",
    house: "Gryffindor",
    year: 3,
    traits: ["Kind", "Loyal", "Determined"],
    favoriteSubjects: ["Herbology"],
    friends: ["harry-potter"],
    rivals: [],
    bio: "Nervous in class, entirely unshakeable in a greenhouse.",
  },
  {
    id: "ginny-weasley",
    name: "Ginny Weasley",
    house: "Gryffindor",
    year: 2,
    traits: ["Brave", "Determined", "Mischievous"],
    favoriteSubjects: ["Charms"],
    friends: ["ron-weasley"],
    rivals: [],
    bio: "Younger than the rest of her friend group and treated that way for about a week, tops.",
  },
  {
    id: "cho-chang",
    name: "Cho Chang",
    house: "Ravenclaw",
    year: 4,
    traits: ["Kind", "Clever"],
    favoriteSubjects: ["Charms"],
    friends: [],
    rivals: [],
    bio: "Popular in the way that comes from actually being easy to talk to.",
  },
  {
    id: "cedric-diggory",
    name: "Cedric Diggory",
    house: "Hufflepuff",
    year: 5,
    traits: ["Loyal", "Determined", "Kind"],
    favoriteSubjects: ["Transfiguration"],
    friends: [],
    rivals: [],
    bio: "The kind of prefect who actually notices when someone's having a rough week.",
  },
  {
    id: "seamus-finnigan",
    name: "Seamus Finnigan",
    house: "Gryffindor",
    year: 3,
    traits: ["Mischievous", "Brave"],
    favoriteSubjects: ["Charms"],
    friends: ["harry-potter"],
    rivals: [],
    bio: "His charms have a documented, alarming tendency to explode.",
  },
  {
    id: "padma-patil",
    name: "Padma Patil",
    house: "Ravenclaw",
    year: 3,
    traits: ["Clever", "Curious"],
    favoriteSubjects: ["Astronomy"],
    friends: [],
    rivals: [],
    bio: "Keeps meticulous notes and lends them out more generously than she probably should.",
  },
  {
    id: "blaise-zabini",
    name: "Blaise Zabini",
    house: "Slytherin",
    year: 3,
    traits: ["Ambitious", "Clever"],
    favoriteSubjects: ["Potions"],
    friends: ["draco-malfoy"],
    rivals: [],
    bio: "Says little, misses nothing.",
  },
];

export function getStudent(id: string): Student | undefined {
  return students.find((s) => s.id === id);
}
