import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    return NextResponse.json({
      status: "ok",
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
};