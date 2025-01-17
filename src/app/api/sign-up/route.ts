import dbConnect from "@/lib/dbConnect";
import User from "@/model/user";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import UserModel from "@/model/user";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();
        
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: 'Username already taken',
            }, { status: 400 });
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existingUserVerifiedByEmail = await UserModel.findOne({email});
        if (existingUserVerifiedByEmail) {
            if(existingUserVerifiedByEmail.isVerified) {
            return Response.json({
                success: false,
                message: 'Email already taken',
            }, { status: 400 });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserVerifiedByEmail.password = hashedPassword;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserVerifiedByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

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

        // send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (emailResponse.success) {
            return Response.json({
                success: true,
                message: 'User registered successfully',
            }, { status: 201 });
        } else {
            return Response.json({
                success: false,
                message: emailResponse.message,
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error registring user', error);
        return Response.json({
            success: false,
            message: 'Error registring user',
        },
        {
            status: 500
        }
    );
    }
}