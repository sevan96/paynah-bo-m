"use client";

import { IUser } from "@/core/interfaces/user";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, X } from "lucide-react";
import React, { useState } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { addAccount, editAccount } from "@/core/apis/bank-account";
import { IAccount } from "@/core/interfaces/account";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { balanceOffset, formatCFA } from "@/lib/utils";
import { downloadFile } from "@/core/apis/download-file";
interface AccountsActionProps {
  lang: string;
  mode: string;
  merchant: IUser;
  children: React.ReactNode;
  isAccountActionLoading: boolean;
  setAccountActionLoading: (
    value: ((prevState: boolean) => boolean) | boolean
  ) => void;
  account?: IAccount;
  open: boolean;
  setOpen: (value: ((prevState: boolean) => boolean) | boolean) => void;
}

export default function AccountsAction({
  lang,
  merchant,
  children,
  mode,
  isAccountActionLoading,
  setAccountActionLoading,
  account,
  open,
  setOpen,
}: AccountsActionProps) {
  const [isExportPaynahIdFileLoading, setExportPaynahIdFileLoading] =
    useState(false);

  const formSchema = z.object({
    name: z.string().min(2),
    type: z.string().min(2),
    isMain: z.boolean(),
  });

  const formSchemaEdit = z.object({
    name: z.string().min(2),
  });

  const AccountsActionAddForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      isMain: false,
      type: "PAY-DEP",
    },
  });

  // console.log('open', open);
  // console.log('mode', mode);
  // console.log('acc', account);

  const AccountsActionEditForm = useForm<z.infer<typeof formSchemaEdit>>({
    resolver: zodResolver(formSchemaEdit),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmitAccountsAddAction(values: z.infer<typeof formSchema>) {
    console.log(values);
    setAccountActionLoading(true);

    addAccount(
      values,
      String(merchant.merchantsIds[0].id),
      String(merchant.accessToken)
    )
      .then((res) => {
        if (res.success) {
          setAccountActionLoading(false);
          setOpen(false);
          AccountsActionAddForm.reset();
          toast.success("Compte ajouté avec succès !", {
            className:
              "!bg-green-50 !max-w-xl !text-green-600 !shadow-2xl !shadow-green-50/50 text-sm font-medium",
          });
        } else {
          console.log(res);
          setAccountActionLoading(false);
          return toast.error(res.message, {
            className:
              "!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium",
          });
        }
      })
      .catch((err) => {
        setAccountActionLoading(false);
        return toast.error("Une erreur est survénue", {
          className:
            "!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium",
        });
      });
  }

  async function onSubmitAccountsEditAction(
    values: z.infer<typeof formSchemaEdit>
  ) {
    console.log("Edit data", values);
    setAccountActionLoading(true);

    editAccount(
      values,
      String(merchant.merchantsIds[0].id),
      account?.id ?? "",
      String(merchant.accessToken)
    )
      .then((res) => {
        if (res.success) {
          setAccountActionLoading(false);
          setOpen(false);
          AccountsActionAddForm.reset();
          toast.success("Compte modifié avec succès !", {
            className:
              "!bg-green-50 !max-w-xl !text-green-600 !shadow-2xl !shadow-green-50/50 text-sm font-medium",
          });
        } else {
          console.log(res);
          setAccountActionLoading(false);
          return toast.error(res.message, {
            className:
              "!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium",
          });
        }
      })
      .catch((err) => {
        setAccountActionLoading(false);
        return toast.error("Une erreur est survénue", {
          className:
            "!bg-red-50 !max-w-xl !text-red-600 !shadow-2xl !shadow-red-50/50 text-sm font-medium",
        });
      });
  }

  function resetModal() {
    AccountsActionAddForm.reset();
    AccountsActionEditForm.reset();
  }

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={`sm:max-w-[38rem] overflow-y-hidden overflow-x-hidden duration-200 !rounded-3xl bg-[#f4f4f7] px-3 py-3`}
      >
        <div>
          <div className={`rounded-t-2xl bg-white px-8 pb-4 pt-5`}>
            <div className={`flex justify-between items-center space-x-3`}>
              <h2 className={`text-base text-[#626262] font-medium`}>
                {mode == "add"
                  ? `Ajouter un compte`
                  : mode == "edit"
                  ? "Modifier le compte"
                  : "Détails du compte"}
              </h2>
              <DialogClose
                onClick={() => {
                  resetModal();
                }}
              >
                <X strokeWidth={2.4} className={`text-[#767676] h-5 w-5`} />
              </DialogClose>
            </div>
          </div>
        </div>
        <div
          className={`min-h-[6rem] pt-2 pb-5 ${
            mode == "detail" ? "px-0" : "px-8"
          }`}
        >
          <div className={``}>
            {mode == "add" && (
              <Form {...AccountsActionAddForm}>
                <form
                  onSubmit={AccountsActionAddForm.handleSubmit(
                    onSubmitAccountsAddAction
                  )}
                  className={``}
                >
                  <div className={`flex flex-col items-center gap-6`}>
                    <div className={`w-full`}>
                      <FormField
                        control={AccountsActionAddForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl className={""}>
                              <div>
                                <div className={`inline-flex space-x-3 mb-1.5`}>
                                  <h3 className={`text-sm font-medium`}>
                                    Nom du compte
                                  </h3>
                                </div>
                                <Input
                                  type={`text`}
                                  className={`font-light text-sm`}
                                  placeholder="Entrez le nom du compte"
                                  {...field}
                                  style={{
                                    backgroundColor: field.value
                                      ? "#fff"
                                      : "#EAEAEA",
                                  }}
                                  disabled={isAccountActionLoading}
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <div
                      className={`inline-flex items-center text-sm italic font-medium space-x-1.5 mt-6`}
                    >
                      <svg className={`w-5 h-auto`} viewBox="0 0 16.178 16.175">
                        <defs>
                          <clipPath id="clip-pathInfo">
                            <rect width="16.178" height="16.175" fill="none" />
                          </clipPath>
                        </defs>
                        <g clipPath="url(#clip-pathInfo)">
                          <path
                            d="M16.179,8.1A8.089,8.089,0,1,1,8.1,0a8.082,8.082,0,0,1,8.076,8.1m-1,.015a7.085,7.085,0,1,0-6.954,7.064,7.082,7.082,0,0,0,6.954-7.064"
                            transform="translate(0 0)"
                          />
                          <path
                            d="M180.048,191.318c-.132.117-.269.228-.394.351-.108.106-.218.18-.368.1a.27.27,0,0,1-.114-.363,4.43,4.43,0,0,1,.307-.716A2.747,2.747,0,0,1,180.6,189.6a1.175,1.175,0,0,1,1.658.442,1.437,1.437,0,0,1,.144.623c.014,1.057.006,2.113.006,3.17v.274c.185-.166.338-.3.484-.436a.263.263,0,0,1,.451.23,1.032,1.032,0,0,1-.031.147,2.985,2.985,0,0,1-.881,1.371,1.963,1.963,0,0,1-.939.515,1.148,1.148,0,0,1-1.392-1.123c0-1.1,0-2.191,0-3.287v-.179l-.046-.026"
                            transform="translate(-173.155 -183.094)"
                          />
                          <path
                            d="M196.607,100.237a1.221,1.221,0,1,1,1.206,1.23,1.218,1.218,0,0,1-1.206-1.23"
                            transform="translate(-190.032 -95.713)"
                          />
                        </g>
                      </svg>
                      <span>Conseils utiles</span>
                    </div>
                    <ul
                      className={`flex font-light text-sm flex-col italic mt-1.5`}
                    >
                      <li>- Utilisez un nom significatif</li>
                      <li>
                        - Soyez bref en ne saisissant que 22 caractères au
                        maximum
                      </li>
                      <li>- Évitez des caractères complexe</li>
                    </ul>
                  </div>
                  <div className={`flex justify-center items-center`}>
                    <Button
                      type={"submit"}
                      className={`mt-8 w-40 text-sm`}
                      disabled={isAccountActionLoading}
                    >
                      {isAccountActionLoading ? (
                        <ScaleLoader color="#fff" height={15} width={3} />
                      ) : (
                        `Confirmer`
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {mode == "edit" && (
              <>
                <div className={`mb-3`}>
                  <div className={`px-4 pt-2 pb-3 bg-white rounded-lg`}>
                    <div className={`inline-flex flex-col`}>
                      <span
                        className={`text-xs font-light text-[#626262] mb-0.5`}
                      >
                        Nom actuel du compte
                      </span>
                      <p className={`text-sm font-medium`}>{account?.name}</p>
                    </div>
                  </div>
                </div>
                <Form {...AccountsActionEditForm}>
                  <form
                    onSubmit={AccountsActionEditForm.handleSubmit(
                      onSubmitAccountsEditAction
                    )}
                    className={``}
                  >
                    <div className={`flex flex-col items-center gap-6`}>
                      <div className={`w-full`}>
                        <FormField
                          control={AccountsActionEditForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl className={""}>
                                <div>
                                  <div
                                    className={`inline-flex space-x-3 mb-1.5`}
                                  >
                                    <h3 className={`text-sm font-medium`}>
                                      Nouveau nom du compte
                                    </h3>
                                  </div>
                                  <Input
                                    type={`text`}
                                    className={`font-light text-sm`}
                                    placeholder="Entrez le nouveau nom du compte"
                                    {...field}
                                    style={{
                                      backgroundColor: field.value
                                        ? "#fff"
                                        : "#EAEAEA",
                                    }}
                                    disabled={isAccountActionLoading}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      <div
                        className={`inline-flex items-center text-sm italic font-medium space-x-1.5 mt-6`}
                      >
                        <svg
                          className={`w-5 h-auto`}
                          viewBox="0 0 16.178 16.175"
                        >
                          <defs>
                            <clipPath id="clip-pathInfo">
                              <rect
                                width="16.178"
                                height="16.175"
                                fill="none"
                              />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#clip-pathInfo)">
                            <path
                              d="M16.179,8.1A8.089,8.089,0,1,1,8.1,0a8.082,8.082,0,0,1,8.076,8.1m-1,.015a7.085,7.085,0,1,0-6.954,7.064,7.082,7.082,0,0,0,6.954-7.064"
                              transform="translate(0 0)"
                            />
                            <path
                              d="M180.048,191.318c-.132.117-.269.228-.394.351-.108.106-.218.18-.368.1a.27.27,0,0,1-.114-.363,4.43,4.43,0,0,1,.307-.716A2.747,2.747,0,0,1,180.6,189.6a1.175,1.175,0,0,1,1.658.442,1.437,1.437,0,0,1,.144.623c.014,1.057.006,2.113.006,3.17v.274c.185-.166.338-.3.484-.436a.263.263,0,0,1,.451.23,1.032,1.032,0,0,1-.031.147,2.985,2.985,0,0,1-.881,1.371,1.963,1.963,0,0,1-.939.515,1.148,1.148,0,0,1-1.392-1.123c0-1.1,0-2.191,0-3.287v-.179l-.046-.026"
                              transform="translate(-173.155 -183.094)"
                            />
                            <path
                              d="M196.607,100.237a1.221,1.221,0,1,1,1.206,1.23,1.218,1.218,0,0,1-1.206-1.23"
                              transform="translate(-190.032 -95.713)"
                            />
                          </g>
                        </svg>
                        <span>Conseils utiles</span>
                      </div>
                      <ul
                        className={`flex font-light text-sm flex-col italic mt-1.5`}
                      >
                        <li>- Utilisez un nom significatif</li>
                        <li>
                          - Soyez bref en ne saisissant que 22 caractères au
                          maximum
                        </li>
                        <li>- Évitez des caractères complexe</li>
                      </ul>
                    </div>
                    <div className={`flex justify-center items-center`}>
                      <Button
                        type={"submit"}
                        className={`mt-8 w-40 text-sm`}
                        disabled={isAccountActionLoading}
                      >
                        {isAccountActionLoading ? (
                          <ScaleLoader color="#fff" height={15} width={3} />
                        ) : (
                          `Confirmer`
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}

            {mode == "detail" && (
              <div>
                <Tabs defaultValue="infos" className="rounded-2xl">
                  <div className={`px-8`}>
                    <TabsList className={`rounded-xl !bg-[#f0f0f0]`}>
                      <TabsTrigger
                        className={`rounded-lg font-normal py-2 px-4 text-sm`}
                        value="infos"
                      >{`Informations générales`}</TabsTrigger>
                      <TabsTrigger
                        className={`rounded-lg font-normal py-2 px-4 text-sm`}
                        value="sold"
                      >{`Détails du solde`}</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="infos">
                    <div
                      className={`mt-4 bg-white rounded-2xl px-8 pt-4 pb-7 h-[273px]`}
                    >
                      <div className={`grid grid-cols-3 gap-4`}>
                        <div className={`col-span-3`}>
                          <div className={`inline-flex flex-col`}>
                            <span
                              className={`text-xs font-light text-[#626262] mb-0.5`}
                            >
                              Nom du compte
                            </span>
                            <p className={`text-sm font-medium`}>
                              {!account?.name || account?.name == "Main"
                                ? "Compte principal"
                                : `${account?.name}`}
                            </p>
                          </div>
                        </div>
                        <div className={`col-span-3`}>
                          <div className={`inline-flex flex-col`}>
                            <span
                              className={`text-xs font-light text-[#626262] mb-0.5`}
                            >
                              Numéro du compte
                            </span>
                            <p className={`text-sm font-medium`}>
                              {account?.coreBankId}
                            </p>
                          </div>
                        </div>
                        <div className={`col-span-1`}>
                          <div className={`inline-flex flex-col`}>
                            <span
                              className={`text-xs font-light text-[#626262] mb-0.5`}
                            >
                              Devise du compte
                            </span>
                            <p className={`text-sm font-medium`}>Franc CFA</p>
                          </div>
                        </div>
                        <div className={`col-span-1`}>
                          <div className={`inline-flex flex-col`}>
                            <span
                              className={`text-xs font-light text-[#626262] mb-0.5`}
                            >
                              Date d’ouverture
                            </span>
                            <p className={`text-sm font-medium`}>-</p>
                          </div>
                        </div>
                        <div className={`col-span-3`}>
                          <Button
                            className={`${
                              isExportPaynahIdFileLoading
                                ? "bg-black"
                                : "bg-transparent"
                            } font-light text-xs h-[2.8rem] text-black hover:text-white border border-[#858587] inline-flex items-center mt-2`}
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
                    </div>
                  </TabsContent>
                  <TabsContent value="sold">
                    <div
                      className={`mt-4 bg-white rounded-2xl px-8 pt-4 pb-7 h-[273px]`}
                    >
                      <div className={`grid grid-cols-3 gap-4`}>
                        <div className={`col-span-3`}>
                          <div className={`inline-flex flex-col`}>
                            <span
                              className={`text-xs font-light text-[#626262] mb-0.5`}
                            >
                              Solde du compte
                            </span>
                            <p className={`text-sm font-medium`}>
                              {account?.balance
                                ? formatCFA(account?.balance)
                                : "-"}
                            </p>
                          </div>
                        </div>
                        <div className={`col-span-3`}>
                          <div className={`inline-flex flex-col`}>
                            <span
                              className={`text-xs font-light text-[#626262] mb-0.5`}
                            >
                              Solde effectif disponible
                            </span>
                            <p className={`text-sm font-medium`}>
                              {account?.skaleet_balance == null
                                ? "-"
                                : formatCFA(account?.skaleet_balance)}
                            </p>
                          </div>
                        </div>
                        <div className={`col-span-1`}>
                          <div className={`inline-flex flex-col`}>
                            <span
                              className={`text-xs font-light text-[#626262] mb-0.5`}
                            >
                              Solde non compensé
                            </span>
                            <p className={`text-sm font-medium`}>
                              {account?.balance == null &&
                              account?.skaleet_balance == null
                                ? "-"
                                : formatCFA(
                                    balanceOffset(
                                      account?.balance,
                                      account?.skaleet_balance
                                    ).nonCompensatedBalance
                                  )}
                            </p>
                          </div>
                        </div>
                        <div className={`col-span-2`}>
                          <div className={`inline-flex flex-col`}>
                            <span
                              className={`text-xs font-light text-[#626262] mb-0.5`}
                            >
                              Proportion du solde compensé
                            </span>
                            <p className={`text-sm font-medium`}>
                              {account?.balance == null &&
                              account?.skaleet_balance == null
                                ? "-"
                                : balanceOffset(
                                    account?.balance,
                                    account?.skaleet_balance
                                  ).proportion + "%"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
