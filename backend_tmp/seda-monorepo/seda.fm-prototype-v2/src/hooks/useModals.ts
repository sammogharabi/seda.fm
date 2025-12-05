import { useState, useCallback } from 'react';

export interface ModalsHook {
  // Modal States
  showCreatePost: boolean;
  showCreateRoom: boolean;
  showCreateCrate: boolean;
  showCreateModal: boolean;
  showTrackUpload: boolean;
  emailSignupDismissed: boolean;
  
  // Modal Actions
  setShowCreatePost: (show: boolean) => void;
  setShowCreateRoom: (show: boolean) => void;
  setShowCreateCrate: (show: boolean) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowTrackUpload: (show: boolean) => void;
  setEmailSignupDismissed: (dismissed: boolean) => void;
  
  // Modal Handlers
  handleDismissEmailSignup: () => void;
  handleOpenCreatePost: () => void;
  handleOpenCreateRoom: () => void;
  handleOpenCreateCrate: () => void;
  handleOpenCreateModal: () => void;
  handleOpenTrackUpload: () => void;
  handleCloseAllModals: () => void;
}

export const useModals = (): ModalsHook => {
  // Modal States
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showCreateCrate, setShowCreateCrate] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTrackUpload, setShowTrackUpload] = useState(false);
  const [emailSignupDismissed, setEmailSignupDismissed] = useState(() => {
    return localStorage.getItem('seda_email_signup_dismissed') === 'true';
  });

  // Modal Handlers
  const handleDismissEmailSignup = useCallback(() => {
    setEmailSignupDismissed(true);
    localStorage.setItem('seda_email_signup_dismissed', 'true');
  }, []);

  const handleOpenCreatePost = useCallback(() => {
    setShowCreateModal(false);
    setShowCreatePost(true);
  }, []);

  const handleOpenCreateRoom = useCallback(() => {
    setShowCreateModal(false);
    setShowCreateRoom(true);
  }, []);

  const handleOpenCreateCrate = useCallback(() => {
    setShowCreateModal(false);
    setShowCreateCrate(true);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleOpenTrackUpload = useCallback(() => {
    setShowCreateModal(false);
    setShowTrackUpload(true);
  }, []);

  const handleCloseAllModals = useCallback(() => {
    setShowCreatePost(false);
    setShowCreateRoom(false);
    setShowCreateCrate(false);
    setShowCreateModal(false);
    setShowTrackUpload(false);
  }, []);

  return {
    // Modal States
    showCreatePost,
    showCreateRoom,
    showCreateCrate,
    showCreateModal,
    showTrackUpload,
    emailSignupDismissed,
    
    // Modal Actions
    setShowCreatePost,
    setShowCreateRoom,
    setShowCreateCrate,
    setShowCreateModal,
    setShowTrackUpload,
    setEmailSignupDismissed,
    
    // Modal Handlers
    handleDismissEmailSignup,
    handleOpenCreatePost,
    handleOpenCreateRoom,
    handleOpenCreateCrate,
    handleOpenCreateModal,
    handleOpenTrackUpload,
    handleCloseAllModals,
  };
};