import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User not found",
                }),
                { status: 404 }
            );
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Account verified successfully",
                }),
                { status: 200 }
            );
        } else if (!isCodeValid) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Invalid code",
                }),
                { status: 400 }
            );
        } else {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Verification code is expired. Please sign up again.",
                }),
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error in verifying user", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Error in verifying user",
            }),
            { status: 500 }
        );
    }
}