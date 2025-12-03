import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user?.email) {
        try {
          // Check if profile already exists
          const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("email")
            .eq("email", user.email)
            .single();

          // If profile doesn't exist, create it with 1 credit
          if (!existingProfile) {
            await supabaseAdmin.from("profiles").upsert(
              {
                email: user.email,
                credits: 1, // Give 1 credit to new users
                subscription_tier: "free",
                subscription_status: null,
              },
              { onConflict: "email" }
            );
            console.log(
              `New user profile created for ${user.email} with 1 credit`
            );
          }
        } catch (error) {
          console.error("Error creating user profile:", error);
          // Don't block sign-in if profile creation fails
        }
      }
      return true;
    },
  },
};
