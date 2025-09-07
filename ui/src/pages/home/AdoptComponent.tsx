import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutateAdoptPet } from "@/hooks/useMutateAdoptPet";
import { Loader2Icon, HeartIcon, PawPrintIcon, SparklesIcon } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleTap, itemFade, listStagger } from "@/components/motion/variants";

const INTIAAL_PET_IMAGE_URL =
  "https://raw.githubusercontent.com/xfajarr/stacklend/refs/heads/main/photo_2023-04-30_12-46-11.jpg";

export default function AdoptComponent() {
  const [petName, setPetName] = useState("");
  const { mutate: mutateAdoptPet, isPending: isAdopting } = useMutateAdoptPet();
  const suggestions = ["Ron", "xFajar", "Nori", "Pixel", "Pico", "Mint"];

  const handleAdoptPet = () => {
    if (!petName.trim()) return;
    mutateAdoptPet({ name: petName });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdoptPet();
  };

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="show" exit="exit">
      <Card className="w-full max-w-md text-center border border-border shadow-sm overflow-hidden">
        <CardHeader className="relative">
          <div className="absolute inset-0 -z-10">
            <motion.div
              className="absolute left-1/2 top-4 -translate-x-1/2 size-40 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, var(--accent) 0%, transparent 70%)",
              }}
              animate={{ opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute left-1/2 top-12 -translate-x-1/2 size-52 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, var(--primary) 0%, transparent 70%)",
              }}
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <CardTitle className="text-3xl tracking-tight flex items-center justify-center gap-2">
            <PawPrintIcon className="h-7 w-7 text-primary" />
            Adopt Your Pet
          </CardTitle>
          <CardDescription className="text-base flex items-center justify-center gap-1">
            <SparklesIcon className="h-4 w-4 text-accent" />A gentle friend awaits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <motion.img
              src={INTIAAL_PET_IMAGE_URL}
              alt="Your new pet"
              className="w-44 h-44 mx-auto rounded-full border-4 border-primary/20 bg-secondary object-cover"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.03 }}
            />
          </div>

          <div className="space-y-3">
            <p className="text-lg">What will you name it?</p>
            <Input
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter pet's name"
              disabled={isAdopting}
              className="text-center text-lg"
            />
            {/* Progress bar that fills as you type */}
            <div className="h-2 w-full rounded bg-muted overflow-hidden border">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, petName.trim().length * 10)}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
              />
            </div>
            {/* Suggestions */}
            <motion.div
              variants={listStagger}
              initial="hidden"
              animate="show"
              className="flex flex-wrap justify-center gap-2"
            >
              {suggestions.map((s) => (
                <motion.button
                  key={s}
                  variants={itemFade}
                  className="px-3 cursor-pointer py-1 rounded-full border bg-background hover:bg-accent/30 text-sm"
                  onClick={() => setPetName(s)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
            <p className="text-xs text-muted-foreground">Press Enter to adopt instantly</p>
          </div>

          <div>
            <motion.div {...scaleTap}>
              <Button
                onClick={handleAdoptPet}
                disabled={!petName.trim() || isAdopting}
                className="w-full text-lg py-6"
              >
                {isAdopting ? (
                  <>
                    <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                    Adopting...
                  </>
                ) : (
                  <>
                    <HeartIcon className="mr-2 h-5 w-5" /> Adopt Now
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
