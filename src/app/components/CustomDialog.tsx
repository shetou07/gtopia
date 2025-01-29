import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Check, Crown, AlertCircle, Clock } from "lucide-react";

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  type: "citizen" | "upgrade" | "visa" | "default";
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  type, // 'citizen', 'upgrade', 'visa', 'default'
}) => {
  const getIcon = () => {
    switch (type) {
      case "citizen":
        return <Check className="w-12 h-12 text-green-500 mb-4" />;
      case "upgrade":
        return <Crown className="w-12 h-12 text-yellow-500 mb-4" />;
      case "visa":
        return <Clock className="w-12 h-12 text-blue-500 mb-4" />;
      default:
        return <AlertCircle className="w-12 h-12 text-red-500 mb-4" />;
    }
  };

  const getBgClass = () => {
    switch (type) {
      case "citizen":
        return "bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent";
      case "upgrade":
        return "bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent";
      case "visa":
        return "bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent";
      default:
        return "bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent
        className={`${getBgClass()} border-gray-800 shadow-xl`}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="text-center"
        >
          {getIcon()}
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 mt-6">
            {cancelText && (
              <AlertDialogCancel className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border-gray-700">
                {cancelText}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-none"
            >
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomDialog;
