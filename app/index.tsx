// app/index.tsx
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function Index() {
  const { isSignedIn } = useAuth();

  // Agar user login hai -> home pe bhejo, warna -> sign-in pe
  if (isSignedIn) {
    return <Redirect href="/(root)/(tabs)/home" />;
  } else {
    return <Redirect href="/(auth)/sign-in" />;
  }
}
