import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { Dictionary } from "ramda";
import {
  createActionRuleSet,
  createAmountRuleSet
} from "@terra-money/log-finder-ruleset";
import routes from "../routes";
import ErrorBoundary from "../components/ErrorBoundary";
import { useNetwork, useRequest } from "../HOCs/WithFetch";
import { Denoms } from "../store/DenomStore";
import {
  LogfinderActionRuleSet,
  LogfinderAmountRuleSet
} from "../store/LogfinderRuleSetStore";
import useTerraAssets from "../hooks/useTerraAssets";
import Header from "./Header";
import { Whitelist } from "../store/WhitelistStore";
import { Contracts } from "../store/ContractStore";
import { transformChainId } from "../scripts/utility";
import s from "./App.module.scss";
import { Chains } from "../store/ChainsStore";

type TokenList = Dictionary<Whitelist>;
type ContractList = Dictionary<Contracts>;

const App = () => {
  const chainId = useNetwork();
  const network = transformChainId(chainId);

  const { data: whitelist } =
    useTerraAssets<Dictionary<TokenList>>("cw20/tokens.json");
  const { data: contracts } = useTerraAssets<Dictionary<ContractList>>(
    "cw20/contracts.json"
  );
  const { data: chains } = useTerraAssets<Dictionary<Chains>>("chains.json");

  const response: ActiveDenom = useRequest({ url: `/oracle/denoms/actives` });

  const setWhitelist = useSetRecoilState(Whitelist);
  const setContracts = useSetRecoilState(Contracts);
  const setActionRules = useSetRecoilState(LogfinderActionRuleSet);
  const setAmountRules = useSetRecoilState(LogfinderAmountRuleSet);
  const setDenoms = useSetRecoilState(Denoms);
  const setChains = useSetRecoilState(Chains);

  useEffect(() => {
    const actionRules = createActionRuleSet(network);
    const amountRules = createAmountRuleSet();
    setActionRules(actionRules);
    setAmountRules(amountRules);

    if (whitelist && contracts && chains && response.data?.result) {
      setWhitelist(whitelist[network]);
      setContracts(contracts[network]);
      setDenoms(response.data.result);
      setChains(chains);
    }
  }, [
    response,
    network,
    whitelist,
    contracts,
    chainId,
    chains,
    setDenoms,
    setActionRules,
    setAmountRules,
    setWhitelist,
    setContracts,
    setChains
  ]);

  return (
    <section className={s.main}>
      <Header />
      <section className={s.content}>
        <ErrorBoundary>{routes}</ErrorBoundary>
      </section>
    </section>
  );
};

export default App;
