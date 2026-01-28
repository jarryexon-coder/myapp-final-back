// Entry point for the app
import { registerRootComponent } from 'expo';
import App from './App';

// Register the main component
registerRootComponent(App);

// For web builds, export App for server-side rendering
if (typeof document !== 'undefined') {
  console.log('🏀 NBA Fantasy App - Web version loading...');
  
  // Initialize Firebase early for web
  import('./src/firebase/firebase-config-simple').then(({ checkFirebaseStatus }) => {
    const status = checkFirebaseStatus();
    console.log('Web Firebase Status:', status);
  });
}

export default App;
