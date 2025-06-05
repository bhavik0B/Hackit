import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
  { name: "Red", value: "bg-red-500" },
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Yellow", value: "bg-yellow-400" },
];

export default function App() {
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState("");
  const [shuffledColors, setShuffledColors] = useState([]);
  const [status, setStatus] = useState(""); // correct | wrong | ""
  const [shake, setShake] = useState(false);

  useEffect(() => {
    pickNewTarget();
  }, []);

  const pickNewTarget = () => {
    const shuffled = COLORS.sort(() => 0.5 - Math.random());
    setShuffledColors([...shuffled]);
    setTargetColor(shuffled[Math.floor(Math.random() * shuffled.length)].name);
    setStatus("");
  };

  const handleGuess = (name) => {
    if (name === targetColor) {
      setStatus("correct");
      setScore(score + 1);
      setTimeout(pickNewTarget, 1000);
    } else {
      setStatus("wrong");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-300 to-pink-200 transition-all duration-300 ${shake ? "animate-shake" : ""}`}>
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-extrabold mb-2 text-indigo-700">🎨 Color Match Master</h1>
        <p className="text-lg text-gray-600 mb-6">
          Match the color: <span className="font-bold text-xl text-indigo-900">{targetColor}</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {shuffledColors.map((color, index) => (
            <motion.div
              key={index}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleGuess(color.name)}
              className={`cursor-pointer h-24 rounded-xl ${color.value} transition duration-300`}
            />
          ))}
        </div>

        <AnimatePresence>
          {status === "correct" && (
            <motion.p
              className="text-green-600 font-bold text-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              ✅ Correct!
            </motion.p>
          )}
          {status === "wrong" && (
            <motion.p
              className="text-red-500 font-bold text-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              ❌ Wrong! Try again.
            </motion.p>
          )}
        </AnimatePresence>

        <p className="mt-4 text-sm text-gray-500">Your Score: <span className="font-semibold">{score}</span></p>
      </div>
    </div>
  );
}
