"use client";

import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { TeacherPublicProfileContent } from "@/components/patterns/teacher-public-profile-content";
import { toPublicTeacherProfile } from "@/lib/accounts/teacher-public-profile";
import type { TeacherProfile } from "@/lib/accounts/types";

export interface TeacherProfilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The would-be profile, including any unsaved edits — see teacher-profile-form.tsx's "Preview" button. */
  teacher: TeacherProfile;
}

/**
 * Renders through the exact same component the real public route uses
 * (teacher-public-profile-content.tsx), so "Preview" can never show
 * something the live page wouldn't — the only difference is this can
 * include changes that haven't been saved yet.
 */
function TeacherProfilePreviewModal({ open, onOpenChange, teacher }: TeacherProfilePreviewModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <ModalHeader>
          <ModalTitle>Preview your public profile</ModalTitle>
          <ModalDescription>This is how it would look to a visitor — nothing here is saved yet.</ModalDescription>
        </ModalHeader>
        {teacher.visibility === "private" && (
          <Alert variant="info" className="mb-5">
            Your profile is currently set to Private, so no one can actually see this yet — change that from your dashboard when you&apos;re ready.
          </Alert>
        )}
        <TeacherPublicProfileContent profile={toPublicTeacherProfile(teacher)} />
      </ModalContent>
    </Modal>
  );
}

export { TeacherProfilePreviewModal };
