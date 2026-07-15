/**
 * Cinematic Self-Discipline Warning Applet Core Script
 * 
 * Manages video autoplay with original audio, key clicks,
 * redirection behaviors, and user-decision confirmations.
 */

document.addEventListener('DOMContentLoaded', () => {
  const bgVideo = document.getElementById('bg-video');
  const btnNo = document.getElementById('btn-no');
  const btnYes = document.getElementById('btn-yes');

  // Focus the "No" button by default for swift self-discipline interaction
  if (btnNo) {
    btnNo.focus();
  }

  // Audio status tracker to ensure video is unmuted upon first interaction
  let interactionRegistered = false;

  const unmuteAndPlayVideo = () => {
    if (bgVideo) {
      bgVideo.muted = false; // Enable original audio as requested
      bgVideo.play()
        .then(() => {
          interactionRegistered = true;
        })
        .catch((error) => {
          console.warn('Playback with audio was deferred or prevented by browser:', error);
        });
    }
  };

  // Initially try to autoplay muted (the standard browser policy)
  if (bgVideo) {
    bgVideo.muted = true;
    bgVideo.loop = true;
    bgVideo.playsInline = true;
    bgVideo.play().catch((err) => {
      console.warn('Muted video autoplay blocked on initial load:', err);
    });
  }

  // Fallback body click/keydown listeners to unmute if overlay isn't used
  document.body.addEventListener('click', () => {
    if (!interactionRegistered) {
      unmuteAndPlayVideo();
    }
  }, { once: true });

  document.addEventListener('keydown', () => {
    if (!interactionRegistered) {
      unmuteAndPlayVideo();
    }
  }, { once: true });

  // BEHAVIORAL REDIRECTION LOGIC
  
  // Click NO -> Redirect to Google immediately
  if (btnNo) {
    btnNo.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = 'https://www.google.com';
    });
  }

  // Click YES -> Interactive prompt before decision
  if (btnYes) {
    btnYes.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const confirmed = confirm('Are you absolutely sure you want to continue?');
      if (confirmed) {
        window.location.href = 'https://www.google.com/search?q=remembering+Allah+discipline';
      } else {
        if (btnNo) {
          btnNo.focus();
        }
      }
    });
  }
});
