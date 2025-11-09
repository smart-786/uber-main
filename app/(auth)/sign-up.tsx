import { useSignUp } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import Modal from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  // 🔒 Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace("/(root)/(tabs)/home");
    }
  }, [isSignedIn]);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!form.name || !form.email || !form.password) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setVerification({ ...verification, state: "pending", error: "" });
    } catch (err: any) {
      console.log("Signup Error:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Error",
        err.errors?.[0]?.longMessage || "Something went wrong",
      );
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });

        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      console.log("Verification Error:", JSON.stringify(err, null, 2));
      setVerification({
        ...verification,
        error: err.errors?.[0]?.longMessage || "Verification failed.",
        state: "failed",
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>

        {/* Form */}
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
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
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />
          <OAuth />

          <Text className="text-lg text-center text-general-200 mt-10">
            Already have an account?{" "}
            <Text
              onPress={() => router.push("/(auth)/sign-in")}
              className="text-primary-500"
            >
              Log In
            </Text>
          </Text>
        </View>

        {/* Verification Modal */}
        <Modal isVisible={verification.state === "pending"}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              Verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}.
            </Text>

            <InputField
              label="Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />

            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}

            <CustomButton
              title="Verify Email"
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
            />
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
