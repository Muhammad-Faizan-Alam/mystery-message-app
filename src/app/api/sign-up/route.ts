import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();
        
        const existingUserVerifiedByUsername = await User.findOne({ username, isVerified: true });

        if (existingUserVerifiedByUsername) {
            return new Response(JSON.stringify({ success: false, message: 'Username already taken' }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existingUserVerifiedByEmail = await User.findOne({ email });

        if (existingUserVerifiedByEmail) {
            if (existingUserVerifiedByEmail.isVerified) {
                return new Response(JSON.stringify({ success: false, message: 'Email already taken' }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            } else {
                existingUserVerifiedByEmail.password = await bcrypt.hash(password, 10);
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserVerifiedByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date(Date.now() + 3600000);

            const user = new User({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            });

            await user.save();
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        console.log("Email response:", emailResponse);

        if (emailResponse.success) {
            return new Response(JSON.stringify({ success: true, message: 'User registered successfully' }), {
                status: 201,
                headers: { "Content-Type": "application/json" }
            });
        } else {
            return new Response(JSON.stringify({ success: false, message: emailResponse.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

    } catch (error) {
        console.error('Error registering user:', error);
        return new Response(JSON.stringify({ success: false, message: 'Error registering user' }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}