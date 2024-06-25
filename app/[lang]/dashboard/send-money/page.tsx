import { Locale } from "@/i18n.config";
import SupportShortcut from "@/components/dashboard/serenity-space/SupportShortcut";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Beneficiary from "@/components/dashboard/send-money/Beneficiary";
import AccountListAndTransactions from "@/components/dashboard/send-money/AccountListAndTransactions";
import CustomOperations from "@/components/dashboard/send-money/CustomOperations";
import { SearchParams } from "@/core/interfaces";
import { searchParamsSchema } from "@/components/dashboard/send-money/validations";
import MainActions from "@/components/dashboard/send-money/modals/MainActions";
import Link from "next/link";
import Routes from "@/components/Routes";
import { auth, signOut } from "@/auth";
import { IUser } from "@/core/interfaces/user";
import { getTransactionsType } from "@/core/apis/transaction";

export interface IndexPageProps {
  searchParams: SearchParams;
  params: { lang: Locale };
}

export default async function SendMoneyPage({
  params: { lang },
  searchParams,
}: IndexPageProps) {
  const searchItems = searchParamsSchema.parse(searchParams);

  const session = await auth();

  let merchant;
  if (session && session.user) {
    merchant = session.user as IUser;
  } else {
    merchant = {} as IUser;
  }

  const transactionTypeList = await getTransactionsType(
    "/transaction-types?keyword=PAYOUT",
    String(merchant.accessToken)
  );

  return (
    <>
      <div
        className={`max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 h-full flex flex-col`}
      >
        <div className={`flex justify-between items-center`}>
          <div className={`inline-flex items-center space-x-0.5`}>
            <Link
              href={Routes.dashboard.home.replace("{lang}", lang)}
              className={`text-base text-[#767676] tracking-tight`}
            >
              Serenity Space
            </Link>
            <ChevronRight className={`h-4 w-4 text-[#767676]`} />
            <h2
              className={`text-base text-black tracking-tight`}
            >{`Envoi d'argent`}</h2>
          </div>
          <div
            className={`py-2 px-3 bg-white rounded-xl inline-flex items-center space-x-3`}
          >
            <span className={`text-xs`}>Avez vous des préoccupations ?</span>
            <SupportShortcut lang={lang} />
          </div>
        </div>
        <div className={`flex gap-3 mt-2.5 flex-grow`}>
          <div className={`w-[28%] 2xl:w-[26%]`}>
            {/* <div className={`h-full bg-white px-6 py-8 rounded-2xl`}>
                            <div className={`flex flex-col space-y-2.5`}>
                               <MainActions lang={lang} merchant={merchant}/>
                            </div>
                            <Beneficiary lang={lang} merchant={merchant}/>
                        </div> */}
            <CustomOperations
              lang={lang}
              searchItems={searchItems}
              merchant={merchant}
            />
          </div>
          <div className={`w-[72%] 2xl:w-[74%]`}>
            <AccountListAndTransactions
              lang={lang}
              searchItems={searchItems}
              merchant={merchant}
              transactionType={transactionTypeList.data[0]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
