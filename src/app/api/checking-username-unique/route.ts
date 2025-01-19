import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";


const usernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        const result = usernameQuerySchema.safeParse(queryParam);
        console.log('result', result); // TODO: Remove this line
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0
                    ? usernameErrors.join(', ')
                    : 'Invalid username',
            }, { status: 400 });
        }

        const { username } = result.data;

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: 'Username already exists',
            }, { status: 400 });
        } else {
            return Response.json({
                success: true,
                message: 'Username is unique',
            }, { status: 200 });
        }
    } catch (error) {
        console.log('Error in checking username', error);
        return Response.json({
            success: false,
            message: 'Error in checking username'
        }, { status: 500 });
    }
}