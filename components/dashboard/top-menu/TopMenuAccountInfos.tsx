"use client";

import * as z from "zod";
import { Locale } from "@/i18n.config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCFA } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IUser } from "@/core/interfaces/user";
import { IAccount } from "@/core/interfaces/account";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadFile } from "@/core/apis/download-file";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";

interface TopMenuAccountInfosProps {
  lang: Locale;
  merchant: IUser;
  isDataLoading: boolean;
  accounts: any;
  currentAccount: any;
  handleChangeAccount: (value: string) => void;
}

export default function TopMenuAccountInfos({
  lang,
  merchant,
  isDataLoading,
  accounts,
  currentAccount,
  handleChangeAccount,
}: TopMenuAccountInfosProps) {
  const formSchema = z.object({
    activeAccount: z.string(),
  });

  const [isExportPaynahIdFileLoading, setExportPaynahIdFileLoading] =
    useState(false);

  const accountChoice = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activeAccount: "",
    },
  });

  const transformMerchantNameToMerchantAvatar = (merchantName: string) => {
    const merchantNameSplit =
      merchantName.length > 0 ? merchantName.split(" ") : [];
    return merchantNameSplit.length > 0
      ? merchantNameSplit.length >= 2
        ? `${merchantNameSplit[0][0]}${merchantNameSplit[1][0]}`
        : `${merchantNameSplit[0][0]}`
      : "";
  };

  const downloadPaynahIdFile = () => {
    setExportPaynahIdFileLoading(true);
    downloadFile(
      `/merchants/${merchant.merchantsIds[0].id}/get-paynah-id`,
      "GET",
      null,
      String(merchant.accessToken),
      true,
      "application/pdf"
    )
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "paynah-id.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setExportPaynahIdFileLoading(false);
      })
      .catch((err) => {
        setExportPaynahIdFileLoading(false);

        return toast.error(err.message, {
          className:
            "!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium",
        });
      });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // setLoading(true);
  }

  // console.log('conAc', currentAccount);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className={`focus:outline-none`}>
          <div
            className={`py-[.38rem] pl-[.38rem] pr-1 bg-[#fafafa] rounded-xl border border-[#dadadb]`}
          >
            <div className={`inline-flex items-center space-x-4`}>
              <div
                className={`rounded-xl border border-[#dbdbdb] bg-white aspect-square font-medium flex items-center justify-center`}
              >
                {/*@ts-ignore*/}
                <div
                  className={`h-8 w-8 md:h-10 md:w-10 flex items-center justify-center`}
                >
                  {transformMerchantNameToMerchantAvatar(
                    merchant.merchantsIds[0].name
                  )}
                </div>
              </div>
              <div className={`inline-flex items-center space-x-2`}>
                <div
                  className={`flex flex-col justify-start items-start text-xs`}
                >
                  {/*@ts-ignore*/}
                  <span className={`font-semibold`}>
                    {merchant.merchantsIds[0].name}
                  </span>
                  <span className={`font-light text-[#767676]`}>
                    {isDataLoading ? (
                      <Skeleton
                        className={`h-[16px] w-[71.8px] bg-gray-300 rounded-full`}
                      />
                    ) : (
                      currentAccount?.coreBankId
                    )}
                  </span>
                </div>
                <ChevronDown className={`text-[#626262] h-[1.3rem] w-auto`} />
              </div>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={`shadow px-3 pt-2 pb-4 rounded-3xl w-[25rem] bg-[#f3f4f7]`}
          align={`end`}
        >
          {/*<DropdownMenuLabel>Compte Infos</DropdownMenuLabel>*/}
          {/*<DropdownMenuSeparator />*/}
          {/*<DropdownMenuItem>Profile</DropdownMenuItem>*/}
          <div>
            <div className={`bg-white rounded-t-2xl px-5 py-3`}>
              <div className={`flex justify-between items-center`}>
                <div>
                  <Form {...accountChoice}>
                    <form
                      onSubmit={accountChoice.handleSubmit(onSubmit)}
                      className="space-y-5"
                    >
                      <FormField
                        control={accountChoice.control}
                        name="activeAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    handleChangeAccount(value);
                                  }}
                                  defaultValue={currentAccount?.coreBankId}
                                >
                                  <SelectTrigger
                                    className={`min-w-[10rem] h-[2.5rem] border-[#717171] pl-3 pr-3 font-light text-sm`}
                                    style={{
                                      backgroundColor: field.value
                                        ? "#f0f0f0"
                                        : "#f0f0f0",
                                    }}
                                  >
                                    <SelectValue placeholder="Choisir un compte" />
                                  </SelectTrigger>
                                  <SelectContent className={`bg-[#f0f0f0]`}>
                                    {accounts.map((account: IAccount) => (
                                      <SelectItem
                                        key={account.id}
                                        className={`font-light px-7 focus:bg-gray-100`}
                                        value={account.coreBankId}
                                      >
                                        {!account.name || account.name == "Main"
                                          ? "Compte principal"
                                          : `${account.name}`}
                                      </SelectItem>
                                    ))}
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
                {/*<Link href={`#`}>*/}
                {/*    <svg className={`w-[2.1rem]`} viewBox="0 0 44.203 44.203">*/}
                {/*        <defs>*/}
                {/*            <clipPath id="clip-path3">*/}
                {/*                <rect width="44.203" height="44.203"/>*/}
                {/*            </clipPath>*/}
                {/*        </defs>*/}
                {/*        <g transform="translate(0 -2)">*/}
                {/*            <g transform="translate(0 2)" clipPath="url(#clip-path3)">*/}
                {/*                <path*/}
                {/*                    d="M22.1,0C5.319,0,0,5.319,0,22.1S5.319,44.2,22.1,44.2s22.1-5.319,22.1-22.1S38.884,0,22.1,0m0,40.746C7.944,40.746,3.458,36.259,3.458,22.1S7.944,3.457,22.1,3.457,40.745,7.944,40.745,22.1,36.259,40.746,22.1,40.746"*/}
                {/*                    transform="translate(0 0)"/>*/}
                {/*                <path*/}
                {/*                    d="M39.814,20.3a8.227,8.227,0,0,0-5.73-2.075h-10.6v22.5h4.06v-7.31a4.455,4.455,0,0,1,0-4.28V22.046h6.268a4.366,4.366,0,0,1,2.959,1.05,3.351,3.351,0,0,1,1.191,2.673A3.267,3.267,0,0,1,36.775,28.4a4.428,4.428,0,0,1-2.961,1.029H30.36a2.15,2.15,0,0,0,.111,3.759h3.5a8.4,8.4,0,0,0,5.808-2.074A6.958,6.958,0,0,0,42.1,25.706a7.006,7.006,0,0,0-2.29-5.408"*/}
                {/*                    transform="translate(-8.464 -6.567)"/>*/}
                {/*            </g>*/}
                {/*        </g>*/}
                {/*    </svg>*/}
                {/*</Link>*/}
                <DropdownMenuItem
                  className={`hover:!bg-transparent cursor-pointer p-0`}
                >
                  <X strokeWidth={2.5} className={`h-5 text-[#777] w-auto`} />
                </DropdownMenuItem>
              </div>
            </div>
            <div className={`mt-6`}>
              <div className={`flex flex-col items-center justify-center`}>
                <div
                  className={`rounded-xl border border-[#dbdbdb] bg-white font-medium p-2 flex items-center mb-2`}
                >
                  {/*@ts-ignore*/}
                  <div
                    className={`h-8 w-8 md:h-10 md:w-10 flex items-center text-xl justify-center`}
                  >
                    {transformMerchantNameToMerchantAvatar(
                      merchant.merchantsIds[0].name
                    )}
                  </div>
                </div>
                <p
                  className={`text-sm font-light text-center text-[#767676] mb-6`}
                >
                  {currentAccount?.coreBankId}
                </p>
                <Button
                  className={`${
                    isExportPaynahIdFileLoading ? "bg-black" : "bg-transparent"
                  } font-light text-xs h-[2.2rem] text-black hover:text-white border border-[#858587] inline-flex items-center`}
                  onClick={() => {
                    console.log(merchant.merchantsIds[0].id);
                    downloadPaynahIdFile();
                  }}
                  disabled={isExportPaynahIdFileLoading}
                >
                  {isExportPaynahIdFileLoading ? (
                    <ScaleLoader color="#fff" height={15} width={3} />
                  ) : (
                    <>
                      <Download className={`h-[1rem]`} />
                      <span>Télécharger le Paynah ID</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className={`account-infos mt-8`}>
              <div className={`px-6 pt-5 pb-6 bg-white rounded-3xl`}>
                <div className={`grid grid-cols-2 gap-x-5 gap-y-2`}>
                  <div>
                    <div className={`inline-flex flex-col`}>
                      <span
                        className={`font-light text-xs text-[#626262] mb-[.1rem]`}
                      >
                        Nom du compte
                      </span>
                      <span className={`uppercase text-xs font-semibold`}>
                        {currentAccount?.isMain
                          ? "Compte Principal"
                          : !currentAccount.name
                          ? "Compte"
                          : currentAccount.name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className={`inline-flex flex-col`}>
                      <span
                        className={`font-light text-xs text-[#626262] mb-[.1rem]`}
                      >
                        Numéro du compte
                      </span>
                      <span className={`uppercase text-xs font-semibold`}>
                        {currentAccount?.coreBankId ?? "-"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className={`inline-flex flex-col`}>
                      <span
                        className={`font-light text-xs text-[#626262] mb-[.1rem]`}
                      >
                        Solde du compte
                      </span>
                      <span className={`uppercase text-xs font-semibold`}>
                        {formatCFA(
                          currentAccount != null ? currentAccount.balance : 0
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className={`inline-flex flex-col`}>
                      <span
                        className={`font-light text-xs text-[#626262] mb-[.1rem]`}
                      >
                        Solde effectif disponible
                      </span>
                      <span className={`uppercase text-xs font-semibold`}>
                        {formatCFA(
                          currentAccount != null
                            ? currentAccount.skaleet_balance
                            : 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
