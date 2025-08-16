"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import DocumentInput from "@/components/shared/DocumentInput";

const LoginSchema = z.object({
    documentNumber: z.string(),
    password: z.string()
});

type LoginSchemaType = z.infer<typeof LoginSchema>

export default function LoginPage() {
    const [ errorMessage, setErrorMessage ] = useState("");

    const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema)
    });

    async function handleLogin({ documentNumber, password }: LoginSchemaType) {
        const res = await fetch("https://locbeauty-fastify.onrender.com/api/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentNumber, password }),
        });

        const loginResponse = await res.json();

        if(res.status !== 200) {
            setErrorMessage(loginResponse.error);
        }

        console.log("accessToken: ", loginResponse.accessToken);
        localStorage.setItem("accessToken", loginResponse.accessToken);

        if(loginResponse.success === true) {
            redirect("/dashboard");
        }
    }

    const token = localStorage.getItem("accessToken");

    if (token) {
        redirect("/dashboard");
        return;
    }

    return (
        <div className="h-dvh flex items-center justify-center bg-background">
            <div className="w-full max-w-md p-6">
                <div className="flex flex-col items-center space-y-2 mb-6">
                    <div className="size-36 bg-primary rounded-full flex items-center justify-center">
                        <Image src="/logo.png" alt="logo" width={ 100 } height={ 100 } className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary">Sistema de Gestão</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Login</CardTitle>
                        <CardDescription className="text-center">
              Acesse no sistema com suas credenciais.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="login-form" onSubmit={ handleSubmit(handleLogin) }>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="documentNumber">CPF</Label>
                                    <DocumentInput isCPF={ true } placeholder="000.000.000-00" register={ register("documentNumber") } />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input { ...register("password") } name="password" id="password" type="password" />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <span className="text-red-600 text-sm font-medium">{errorMessage && errorMessage }</span>
                        <Button disabled={ isSubmitting } type="submit" form="login-form" className="w-full cursor-pointer">
                            { isSubmitting ? <LoaderCircle className="animate-spin" /> : "Entrar"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
