"use client"

import {Locale} from "@/i18n.config";
import React, {useState, useEffect} from "react";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {
    AlertTriangle,
    ChevronRight,
    ClipboardList,
    RotateCw,
} from "lucide-react";
import Link from "next/link";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {formatCFA, formatDate, getStatusBadge} from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

import {IUser} from "@/core/interfaces/user";
import {ITransaction} from "@/core/interfaces/transaction";
import {getTransactions} from "@/core/apis/transaction";

interface LastTransactionsProps {
    lang: Locale,
    merchant: IUser
}

export enum TransactionsStatus {
    DONE = 'approved',
    PENDING = 'pending',
    DECLINED = 'declined',
    EXPIRED = 'expired',
}

export enum TransactionsType {
    DEBIT = 'debit',
    CREDIT = 'credit',
}

export default function LastTransactions({lang, merchant}: LastTransactionsProps) {
    // const transactions = [
    //     {
    //         tId: "24553FS3AS",
    //         date: "2024-04-20T11:00:00",
    //         description: "Envoi d'argent",
    //         type: "debit",
    //         amount: 50000,
    //         status: 'approved',
    //     },
    //     {
    //         tId: "24557FS3AS",
    //         date: "2023-03-24T14:00:00",
    //         description: "Envoi d'argent",
    //         type: "credit",
    //         amount: 50000,
    //         status: 'approved',
    //     },
    //     {
    //         tId: "24556FS3AS",
    //         date: "2024-03-24T08:00:00",
    //         description: "Lien de paiement",
    //         type: "credit",
    //         amount: 20000,
    //         status: 'pending',
    //     },
    //     {
    //         tId: "24555FS3AS",
    //         date: "2024-04-20T20:00:00",
    //         description: "Envoi d'argent",
    //         type: "debit",
    //         amount: 50000,
    //         status: 'approved',
    //     },
    //     {
    //         tId: "24554FS3AS",
    //         date: "2024-03-24T12:00:00",
    //         description: "Lien de paiement",
    //         type: "debit",
    //         amount: 50000,
    //         status: 'approved',
    //     },
    //     {
    //         tId: "24558FS3AS",
    //         date: "2024-12-20T13:00:00",
    //         description: "Envoi d'argent",
    //         type: "credit",
    //         amount: 100000,
    //         status: 'declined',
    //     },
    //     {
    //         tId: "24559FS3AS",
    //         date: "2024-09-05T06:00:00",
    //         description: "Envoi d'argent",
    //         type: "debit",
    //         amount: 500000,
    //         status: 'approved',
    //     },
    //     {
    //         tId: "24513FS3AS",
    //         date: "2024-03-09T10:00:00",
    //         description: "Lien de paiement",
    //         type: "credit",
    //         amount: 50000,
    //         status: 'expired',
    //     }
    // ];

    const [isLoading, setLoading] = useState(false);
    const [showConError, setShowConError] = useState(false);
    const [transactions, setTransactions] = useState([]);

    function fecthTransactions() {
        // @ts-ignore
        getTransactions(String(merchant.merchantsIds[0].id), String(merchant.accessToken))
        .then(data => {
            // console.log(data, data);
            setTransactions(data);
        })
        .catch(err => {
            setTransactions([]);
        });
    }

    useEffect(() => {
        fecthTransactions()
    }, []);


    const formSchema = z.object({
        pAccount: z.string().min(1, {
            message: 'Le champ est requis'
        }),
    })

    const selectAccount = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pAccount: "",
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        setLoading(true);

        setShowConError(true);
    }

    return (
        <div className={`bg-white sales-point flex-grow rounded-2xl px-6 py-5`}>
            <div className={`flex items-center justify-between pb-1.5`}>
                <div className={`inline-flex items-center space-x-3`}>
                    <h2 className={`font-medium text-base`}>Transactions récentes</h2>
                    <Form {...selectAccount}>
                        <form onSubmit={selectAccount.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={selectAccount.control}
                                name="pAccount"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <div>
                                                <Select onValueChange={field.onChange} defaultValue={'cp'}>
                                                    <SelectTrigger className={`h-[2.2rem] text-xs rounded-xl border border-[#f4f4f7] pl-2.5 pr-1 font-normal`} style={{
                                                        backgroundColor: field.value ? '#f4f4f7' : '#f4f4f7',
                                                    }}>
                                                        <SelectValue  placeholder="Choisir une devise"/>
                                                    </SelectTrigger>
                                                    <SelectContent className={`bg-[#f0f0f0]`}>
                                                        <SelectItem className={`font-normal text-xs px-7 focus:bg-gray-100`} value={'cp'}>
                                                            Compte principale
                                                        </SelectItem>
                                                        <SelectItem className={`font-normal text-xs px-7 focus:bg-gray-100`} value={'sc'}>
                                                            Salaire corporate
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <div>
                    <Link className={`inline-flex text-xs text-[#909090] hover:underline duration-200 mb-1`} href={`#`}>
                        <span>Voir tout</span>
                        <ChevronRight className={`h-4 w-auto`} />
                    </Link>
                </div>
            </div>
            <div className={`mt-3`}>
            {
                transactions.length == 0 ?
                <div className={`flex justify-center items-center h-full mt-4`}>
                    <div className={`inline-flex flex-col justify-center`}>
                        <svg className={`h-[4rem] w-auto`} viewBox="0 0 102.839 102.308">
                            <defs>
                                <clipPath id="a-pdv">
                                    <rect width="102.839" height="102.308"/>
                                </clipPath>
                            </defs>
                            <g clipPath="url(#a-pdv)">
                                <path
                                    d="M100.927,22.232a2.584,2.584,0,0,0-1.758-1.486q-21.7-5.684-43.392-11.451a3.6,3.6,0,0,0-3.9,1.025c-3.406,3.341-6.923,6.566-10.4,9.829l-1.123,1.2a1.513,1.513,0,0,1-.454,1.362A211.325,211.325,0,0,0,6.377,71.548a.985.985,0,0,1-.351.493L5.234,73.17a3.6,3.6,0,0,1-.616,1.946c-1.861,3.069-2.925,6.287-2.011,10a2.592,2.592,0,0,0,2.206,2.3Q26.525,92.44,48.205,97.572c1.46.344,2.414.409,3.238-1.2a16.149,16.149,0,0,1,3.03-3.555,82.7,82.7,0,0,0,6.741-7.844c5.462-7.215,10.971-14.4,16.895-21.255a2.115,2.115,0,0,0,.577-2.089c-.59-2.829-1.077-5.677-1.635-8.694.746.357.694.714.746,1.019.448,2.433.889,4.873,1.35,7.306.1.551.065,1.22,1.071.675,2.031-1.09,4.172-1.985,6.242-3.023,6.475-3.251,11.919-7.617,14.754-14.52,3.043-7.39,3.517-14.812-.285-22.157M57.587,83.291c-.136-.11-.279-.214-.421-.324q5.644-7.309,11.282-14.618c.143.117.285.227.428.337q-5.645,7.3-11.289,14.6M92.7,48.146a59.893,59.893,0,0,0,4.289-5.794,14.307,14.307,0,0,0,1.946-6.923c1.408,3.205-2.4,9.842-6.235,12.717m6.6-23.461C87.043,37.518,75.267,50.754,65.119,65.358q-7.844,11.28-14.553,23.279a8.685,8.685,0,0,0-.681,6.572c.551,2.258.532,2.251-1.817,1.7L12.683,88.7c-2.622-.61-5.23-1.278-7.857-1.836a1.846,1.846,0,0,1-1.61-1.687,11.8,11.8,0,0,1,1.025-8.117c8.181-16.635,17.681-32.421,29.651-46.643,5.943-7.053,12.327-13.7,18.926-20.139a1.871,1.871,0,0,1,1.337-.746c.869.214,1.706.4,2.543.623q20.826,5.5,41.659,11.01c2.485.655,2.751,1.635.947,3.523"
                                    transform="translate(-0.799 -3.199)"/>
                                <path
                                    d="M68.136,3.755A113.211,113.211,0,0,0,51.581,17.871,61.647,61.647,0,0,1,68.136,3.755"
                                    transform="translate(-18.115 -1.319)"/>
                                <path
                                    d="M95.836,136.289a57.2,57.2,0,0,0,19.105-3.57c-2.079,2.127-15.517,4.62-19.105,3.57"
                                    transform="translate(-33.657 -46.61)"/>
                                <path
                                    d="M.13,133.911l16.493,4.823c-.055.182-.108.363-.161.545L0,134.41c.044-.166.088-.333.131-.5"
                                    transform="translate(0 -47.028)"/>
                                <path
                                    d="M85.621,147.684l4.291,6.253-.337.237a40.366,40.366,0,0,1-4.317-6.221l.363-.268"
                                    transform="translate(-29.942 -51.865)"/>
                                <path
                                    d="M66.9,0c-2.16,1.6-4.433,3.038-6.608,4.616A19.892,19.892,0,0,1,66.9,0"
                                    transform="translate(-21.174)"/>
                                <path
                                    d="M93.123,143.256a12.176,12.176,0,0,1,4.452,2.361,12.2,12.2,0,0,1-4.452-2.361"
                                    transform="translate(-32.704 -50.31)"/>
                                <path
                                    d="M107.03,26.855a32.021,32.021,0,0,1-.675-3.3,2.794,2.794,0,0,0-2.063-2.582,246.575,246.575,0,0,0-32.978-9.083,3.343,3.343,0,0,0-3.244.9A208.02,208.02,0,0,0,47.884,35.283c-1.6,2.135-3.147,4.191-1.213,6.916a1.853,1.853,0,0,1,.169.616,3.379,3.379,0,0,0,2.809,2.725q15.62,4.1,31.213,8.311a2.758,2.758,0,0,0,3.258-1.025,181.626,181.626,0,0,1,21.936-23.72,2.427,2.427,0,0,0,.973-2.251m-2.563-1.246A185.283,185.283,0,0,0,83.276,48.448c-.675.837-1.29,1.765-2.8,1.726C78,49.512,75.3,48.792,72.6,48.065q-11.776-3.143-23.539-6.293c-.363-.1-.72-.208-1.077-.337-1.869-.681-2.277-1.8-1.174-3.5a94.782,94.782,0,0,1,8.324-10.705c4.126-4.691,8.493-9.168,12.879-13.612a3.57,3.57,0,0,1,3.607-1.09,234.483,234.483,0,0,1,32.005,8.856c2.55.882,2.861,2.414.838,4.23"
                                    transform="translate(-16.075 -4.143)"/>
                                <path
                                    d="M64.554,77.929c-2.738-.8-5.5-1.492-8.045-2.174a1.712,1.712,0,0,0-1.59.727c-.48.649-.993,1.278-1.46,1.933-1.032,1.44.045,4.47,1.765,4.95,1.609.448,3.225.856,4.84,1.278,3.173.83,3.173.83,5.087-1.8a4.868,4.868,0,0,0,.376-.526c.448-.8-.227-4.172-.973-4.392M64.3,79.921c-.487.642-.973,1.285-1.447,1.933a1.15,1.15,0,0,1-1.226.577q-3.805-.993-7.611-1.992a.691.691,0,0,1-.558-.688c-.078-1.272,2.582-3.51,3.815-3.192,2.128.545,4.25,1.1,6.371,1.654,1.025.266,1.382.772.655,1.706"
                                    transform="translate(-18.633 -26.604)"/>
                                <path
                                    d="M72.852,110.681c-2.667-.8-5.372-1.479-8.156-2.225a2.138,2.138,0,0,0-.817.272,12.784,12.784,0,0,0-2.537,3.289,1.536,1.536,0,0,0,.045,1.084c.623,1.92,1.6,3.387,3.919,3.517a16.482,16.482,0,0,1,3.108.8c3.218.83,3.218.824,5.171-1.888a4.385,4.385,0,0,0,.285-.4c.532-.889-.143-4.2-1.019-4.457m-.227,2.1c-.5.636-.993,1.265-1.466,1.92a1.084,1.084,0,0,1-.9.558c-2.783-.727-5.223-1.362-7.662-1.992-.928-.24-.915-.83-.5-1.46.532-.8,1.168-1.531,1.758-2.3.4-.519.889-.441,1.447-.292,2.225.61,4.451,1.207,6.689,1.752,1.22.3,1.363.869.636,1.81"
                                    transform="translate(-21.514 -38.089)"/>
                                <path
                                    d="M35.429,85.608c-2.628-.766-5.281-1.421-7.85-2.1a1.422,1.422,0,0,0-1.473.6c-.564.72-1.143,1.427-1.667,2.174-.9,1.285.143,4.366,1.66,4.795,2.375.662,4.782,1.22,7.157,1.875a1.3,1.3,0,0,0,1.55-.487c.584-.772,1.207-1.518,1.745-2.316.643-.96-.136-4.263-1.122-4.548m-.006,2.024c-.494.707-1.039,1.363-1.571,2.037-.311.4-.675.714-1.22.513-2.452-.636-4.885-1.265-7.318-1.908-.376-.1-.707-.26-.779-.7-.169-1.006,2.466-3.614,3.439-3.361,2.283.577,4.554,1.226,6.838,1.8,1.064.266,1.168.824.611,1.622"
                                    transform="translate(-8.466 -29.32)"/>
                                <path
                                    d="M57.868,91.874c-2.726-.837-5.5-1.518-8.247-2.258a1.673,1.673,0,0,0-1.395.753c-.493.642-1,1.272-1.473,1.927-1.058,1.46-.051,4.483,1.687,4.97,2.277.642,4.575,1.207,6.858,1.83a1.475,1.475,0,0,0,1.817-.61c.487-.714,1.077-1.356,1.556-2.063.629-.915.11-4.263-.8-4.548m-.208,1.895c-.526.688-1.065,1.356-1.577,2.05a1.14,1.14,0,0,1-1.259.526c-2.491-.662-4.989-1.311-7.481-1.985-.824-.227-.811-.772-.383-1.362.572-.779,1.161-1.544,1.758-2.31a1.1,1.1,0,0,1,1.3-.35c2.336.629,4.684,1.207,7.027,1.81.967.253,1.278.759.617,1.622"
                                    transform="translate(-16.268 -31.472)"/>
                                <path
                                    d="M47.251,103.9c-1.194-.318-2.395-.616-3.589-.941-3.938-1.077-3.082-1.084-5.469,2.018-1.084,1.4.013,4.444,1.746,4.931,2.024.564,4.061,1.064,6.085,1.6,1.784.467,4.529-1.719,4.471-3.562-.091-2.829-.494-3.335-3.244-4.049M45.584,108.8c-2.076-.539-4.147-1.1-6.229-1.6-1.219-.3-1.582-.824-.72-1.882a15.634,15.634,0,0,0,1.161-1.544,1.666,1.666,0,0,1,2.083-.714c2.122.584,4.256,1.109,6.378,1.693.479.136,1.116.143,1.187.727.091,1.4-2.634,3.64-3.86,3.322"
                                    transform="translate(-13.262 -35.93)"/>
                                <path
                                    d="M40.334,71.141c-1.194-.3-2.375-.662-3.575-.934-3.906-.889-2.79-1.466-5.476,1.953-1.161,1.479-.11,4.535,1.739,5.048,2.011.558,4.042,1.058,6.066,1.583,1.8.467,4.438-1.648,4.444-3.555,0-2.725-.551-3.426-3.2-4.094m1.927,2.329c-.558.792-1.155,1.551-1.732,2.329a1.208,1.208,0,0,1-1.44.4c-2.284-.616-4.561-1.239-6.851-1.817-1.109-.279-1.33-.792-.623-1.693.493-.642.98-1.285,1.453-1.94a1.11,1.11,0,0,1,1.22-.571c2.5.649,5,1.291,7.487,1.953.753.2.941.694.487,1.343"
                                    transform="translate(-10.816 -24.416)"/>
                                <path
                                    d="M27.008,98.271c-2.667-.792-5.372-1.466-7.935-2.148a1.489,1.489,0,0,0-1.525.616C17.023,97.421,16.5,98.1,16,98.8c-1.032,1.453.032,4.464,1.765,4.944,1.6.448,3.212.85,4.821,1.272,3.335.876,3.328.876,5.262-2.018.058-.091.136-.169.188-.26.539-.941-.13-4.2-1.025-4.464m-.156,2.018c-.493.642-.993,1.278-1.46,1.933a1.216,1.216,0,0,1-1.239.59q-3.815-1-7.623-2.018c-.389-.11-.74-.409-.539-.83a10.4,10.4,0,0,1,2.3-3.075c.59-.577,1.337.013,1.979.162,1.985.461,3.951,1.032,5.924,1.531,1.058.272,1.369.779.662,1.706"
                                    transform="translate(-5.476 -33.749)"/>
                                <path
                                    d="M86.337,83.677c-1.246-.324-2.491-.662-3.737-.98-3.322-.85-3.322-.85-5.346,1.94a3.619,3.619,0,0,0,1.823,5.126c1.972.526,3.945,1.038,5.924,1.505.688.162,1.486.779,2.109.065a10.787,10.787,0,0,0,2.381-3.257c.013-3.023-.506-3.7-3.153-4.4m1.836,2.381q-.866,1.158-1.752,2.31a1.109,1.109,0,0,1-1.3.357q-3.5-.934-7.014-1.843c-.993-.26-1.252-.753-.6-1.609.519-.688,1.038-1.369,1.557-2.063A1.139,1.139,0,0,1,80.31,82.7c2.5.655,5,1.3,7.481,1.985.759.214.843.759.383,1.375"
                                    transform="translate(-26.96 -28.868)"/>
                                <path
                                    d="M82.117,98.584a1.383,1.383,0,0,0-.753-.558c-2.641-.72-5.288-1.4-7.766-2.057a1.479,1.479,0,0,0-1.564.584c-.493.636-.986,1.272-1.466,1.92a3.623,3.623,0,0,0,1.784,5.145c2.174.59,4.36,1.135,6.546,1.68a1.669,1.669,0,0,0,1.388.032c1.856-1.032,2.946-4.95,1.83-6.748m-4.5,3.8c-2.031-.526-4.049-1.09-6.086-1.59-1.252-.3-1.324-.921-.59-1.823,2.452-3.036,1.2-2.725,4.9-1.791,1.667.422,3.328.869,5,1.291.493.13.941.272.928.733-.156,1.7-2.7,3.549-4.146,3.179"
                                    transform="translate(-24.608 -33.693)"/>
                                <path d="M44.929,129.8,4.544,118.983l.13-.493L45.1,129.328l-.171.473"
                                    transform="translate(-1.596 -41.613)"/>
                                <path
                                    d="M104.372,23.218q-12.243-3.231-24.5-6.436c-.357-.1-.727-.162-.74-.162a2.259,2.259,0,0,0-2.148.9c-2.913,3.387-5.859,6.748-8.746,10.167-1.479,1.752-.993,3.179,1.259,3.828,8,2.329,16.019,4.626,24.019,6.955a2.627,2.627,0,0,0,3.017-.843c3.01-3.38,6.092-6.7,9.129-10.044,1.946-2.141,1.512-3.62-1.291-4.366m.967,3.828q-4.555,5.032-9.142,10.037a2.015,2.015,0,0,1-1.94.954c-.169-.045-.532-.143-.9-.247Q81.742,34.452,70.109,31.1c-2.511-.727-2.757-1.564-1.019-3.575,2.712-3.14,5.469-6.235,8.156-9.395a2.189,2.189,0,0,1,2.537-.8c8.214,2.193,16.434,4.334,24.648,6.508,2.083.551,2.375,1.59.908,3.205"
                                    transform="translate(-23.668 -5.832)"/>
                                <path
                                    d="M85.744,52.651a194.03,194.03,0,0,1-22.955-6.41c7.71,1.926,15.323,4.2,22.955,6.41"
                                    transform="translate(-22.051 -16.239)"/>
                                <path
                                    d="M78.046,57.407c-4.211-1.133-8.358-2.467-12.454-3.962l.13-.423,12.451,3.924-.127.461"
                                    transform="translate(-23.035 -18.621)"/>
                                <path
                                    d="M64.132,81.566a11.129,11.129,0,0,1-5.555-.34c.014-.132.028-.263.042-.394l5.514.734"
                                    transform="translate(-20.572 -28.388)"/>
                                <path d="M66.463,112.416l4.923,1a5.482,5.482,0,0,1-4.923-1"
                                    transform="translate(-23.341 -39.48)"/>
                                <path
                                    d="M33.479,88.166a6.955,6.955,0,0,1-4.98-1.027c1.677.245,3.322.646,4.98,1.027"
                                    transform="translate(-10.009 -30.603)"/>
                                <path d="M50.508,94,54.6,95.186A4.477,4.477,0,0,1,50.508,94"
                                    transform="translate(-17.738 -33.012)"/>
                                <path d="M43.34,105.811l4.073.628c-1.669.551-2.38.452-4.073-.628"
                                    transform="translate(-15.221 -37.16)"/>
                                <path
                                    d="M39.133,75.171l-5.07-.824.064-.431a22.871,22.871,0,0,1,5.075.819q-.034.218-.069.436"
                                    transform="translate(-11.963 -25.959)"/>
                                <path
                                    d="M21.431,101.341a23.9,23.9,0,0,1,5.065.428c-.009.139-.019.279-.028.418l-5.028-.353c0-.164-.006-.328-.008-.492"
                                    transform="translate(-7.526 -35.59)"/>
                                <path d="M85.754,87.317,80.889,86.2a5.753,5.753,0,0,1,4.865,1.114"
                                    transform="translate(-28.408 -30.209)"/>
                                <path
                                    d="M80.926,101.288a21.256,21.256,0,0,1-4.863-1.2c.034-.148.067-.3.1-.443l4.854,1.239c-.031.134-.062.269-.092.4"
                                    transform="translate(-26.713 -34.995)"/>
                                <path
                                    d="M105.579,26.155c-2.3.45-4.678.4-7,.751-2.447.372-4.861.609-7.332.751l-2.665.152-6.146-8.141c-.622-.823-2.031-.016-1.4.818l5.612,7.433-10.4.595c-1.038.06-1.045,1.682,0,1.622l11.571-.662.8,1.063c2.113,2.8,4.219,5.643,7.173,7.616.87.581,1.683-.823.818-1.4-2.828-1.89-4.839-4.708-6.859-7.39l1.81-.1c2.458-.141,4.86-.4,7.293-.768,2.372-.363,4.791-.313,7.149-.774,1.023-.2.59-1.764-.431-1.564"
                                    transform="translate(-26.505 -6.787)"/>
                            </g>
                        </svg>
                        <span className={`text-xs text-[#7d7d7d] mt-1`}>Aucune transaction retrouvée</span>
                    </div>
                </div> : 
                <Table>
                    <TableHeader>
                        <TableRow className={`text-xs border-[#f4f4f4]`}>
                            <TableHead className={`text-[#afafaf] font-normal h-9 min-w-[8rem]`}>ID Transactions</TableHead>
                            <TableHead className={`text-[#afafaf] font-normal h-9 min-w-[7rem]`}>Descritpion</TableHead>
                            <TableHead className={`text-[#afafaf] font-normal h-9`}>Montant</TableHead>
                            <TableHead className={`text-[#afafaf] font-normal h-9 min-w-[7rem]`}>Date</TableHead>
                            <TableHead className={`text-[#afafaf] font-normal h-9`}>Statut</TableHead>
                            <TableHead className={`text-[#afafaf] font-normal h-9 text-center`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction: ITransaction) => (
                            <TableRow className={`border-[#f4f4f4]`} key={transaction.tId}>
                                <TableCell className="text-xs font-medium !py-3.5">{transaction.tId}</TableCell>
                                <TableCell className="text-xs !py-3.5">{transaction.description}</TableCell>
                                <TableCell className="text-xs font-medium !py-3.5">
                                   <div className={`${transaction.type == TransactionsType.DEBIT ? 'text-[#ff0000]' : 'text-[#19b2a6]'}`}>{transaction.type == TransactionsType.DEBIT ? '-' : ''}{formatCFA(transaction.amount)}</div>
                                </TableCell>
                                <TableCell className="text-xs !py-3.5">{formatDate(transaction.date, lang)}</TableCell>
                                {/*<TableCell className="text-xs !py-3.5">*/}
                                {/*    <div>*/}
                                {/*        {transaction.type == "debit" ?*/}
                                {/*            <div className="inline-flex space-x-1 items-center">*/}
                                {/*                <span>Débit</span>*/}
                                {/*                <MoveUpRight className="h-4" />*/}
                                {/*            </div> : <div className="inline-flex space-x-1 items-center">*/}
                                {/*                <span>Crédit</span>*/}
                                {/*                <MoveDownLeft className="h-4" />*/}
                                {/*            </div>*/}
                                {/*        }*/}
                                {/*    </div>*/}
                                {/*</TableCell>*/}
                                <TableCell className="text-xs !py-3.5">
                                    <div dangerouslySetInnerHTML={{__html: getStatusBadge(transaction.status)}}></div>
                                </TableCell>
                                <TableCell className="text-xs !py-3 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className={`focus:outline-none`} asChild>
                                            <button className={`rounded-full bg-[#f0f0f0] hover:bg-gray-200 duration-200 p-1`}>
                                                <svg className={`h-3 w-auto`} viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                     strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="1"/>
                                                    <circle cx="12" cy="5" r="1"/>
                                                    <circle cx="12" cy="19" r="1"/>
                                                </svg>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48 rounded-xl z-[100] shadow-md" align={"end"}>
                                            <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                                <ClipboardList className="mr-2 h-3.5 w-3.5" />
                                                <span className={`mt-[1.5px]`}>{`Détails de l'opération`}</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                                <AlertTriangle className="mr-2 h-3.5 w-3.5" />
                                                <span className={`mt-[1.5px]`}>Faire une réclamation</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className={`text-xs cursor-pointer`}>
                                                <RotateCw className="mr-2 h-3.5 w-3.5" />
                                                <span className={`mt-[1.5px]`}>{`Refaire l'opération`}</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            }    
            </div>
        </div>
    );
}