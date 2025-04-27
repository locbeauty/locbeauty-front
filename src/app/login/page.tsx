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
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/utils/routes";

export default function LoginPage() {

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
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
                        <form>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="exemplo@empresa.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input id="password" type="password" />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full" asChild>
                            <Link href={ ROUTES.DASHBOARD }>Entrar</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
