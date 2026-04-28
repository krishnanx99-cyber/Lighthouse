import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function ProtectedRoute({ children, allowedRole }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === allowedRole) {
            const userData = userDoc.data();
            // Redirect to onboarding if not complete (only for Volunteers)
            if (allowedRole === 'Volunteer' && !userData.onboardingComplete && window.location.pathname !== '/hub/onboarding') {
              setAuthorized('onboarding');
            } else {
              setAuthorized('authorized');
            }
          } else {
            setAuthorized('unauthorized');
          }
        } catch (error) {
          console.error("Error fetching user role", error);
          setAuthorized('unauthorized');
        }
      } else {
        setAuthorized('unauthorized');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [allowedRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (authorized === 'unauthorized') {
    return <Navigate to="/" replace />;
  }

  if (authorized === 'onboarding') {
    return <Navigate to="/hub/onboarding" replace />;
  }

  return children;
}
