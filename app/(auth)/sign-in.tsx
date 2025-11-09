import { useSignIn, useAuth } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignInScreen = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // 🔹 Step 1: Clear old session (avoid "already logged in" error)
  useEffect(() => {
    signOut().catch(() => {});
  }, [signOut]);

  // 🔹 Step 2: Handle Sign In
  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert("Error", "Login incomplete. Please try again.");
      }
    } catch (err: any) {
      console.log("SignIn error:", JSON.stringify(err, null, 2));
      const msg =
        err.errors?.[0]?.longMessage ||
        err.message ||
        "Something went wrong during sign in.";
      Alert.alert("Error", msg);
    }
  }, [isLoaded, signIn, form.email, form.password, setActive]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome 👋
          </Text>
        </View>

        {/* Form */}
        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title="Sign In"
            onPress={handleSignIn}
            className="mt-6"
          />

          <OAuth />

          <Link
            href="/(auth)/sign-up"
            className="text-lg text-center text-general-200 mt-10"
          >
            Don’t have an account?{" "}
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignInScreen;
