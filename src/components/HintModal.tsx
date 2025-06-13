import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, title, content }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Close modal by clicking the background
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            className="w-full max-w-2xl"
          >
            <Card className="shadow-2xl border-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
                  <X className="h-6 w-6" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{content}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                  <Button onClick={onClose} className="h-12 text-lg">Got it!</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};