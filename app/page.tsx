import Image from "next/image";
import { rubik } from "./fonts";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center text-center">
      <h1 className={`${rubik.className} text-white text-semibold`}>
      </h1>
    </div>
  );
}