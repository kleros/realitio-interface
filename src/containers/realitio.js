import React, { Component } from "react";
import Web3 from "web3";
import RealitioProxyContract from "../assets/contracts/realitio-proxy.json";
import RealityLogo from "../assets/images/realitio_logo.png";
import { populatedJSONForTemplate } from "@reality.eth/reality-eth-lib/formatters/question";
import DOMPurify from 'isomorphic-dompurify';

class RealitioDisplayInterface extends Component {
  state = { question: null };

  async componentDidMount() {
    if (window.location.search[0] !== "?") return;

    const message = JSON.parse(decodeURIComponent(window.location.search.substring(1)));
    console.debug(message);

    const subgraphs = {
      1: 'https://api.thegraph.com/subgraphs/name/realityeth/realityeth',
      5: 'https://api.thegraph.com/subgraphs/name/realityeth/realityeth-goerli',
      10: 'https://api.thegraph.com/subgraphs/name/realityeth/realityeth-optimism',
      100: 'https://api.thegraph.com/subgraphs/name/realityeth/realityeth-gnosis',
      42161: 'https://api.thegraph.com/subgraphs/name/realityeth/realityeth-arbitrum',
      421613: 'https://api.thegraph.com/subgraphs/name/realityeth/realityeth-arbitrum-goerli',
    }

    const {
      arbitrableContractAddress,
      arbitratorContractAddress,
      disputeID,
      arbitratorChainID,
      arbitrableChainID,
      chainID,
      arbitratorJsonRpcUrl,
      arbitrableJsonRpcUrl,
      jsonRpcUrl,
    } = message;

    const rpcURL = arbitrableJsonRpcUrl || arbitratorJsonRpcUrl || jsonRpcUrl;
    const cid = arbitrableChainID || arbitratorChainID || chainID;

    if (!rpcURL || !disputeID || !arbitratorContractAddress || !cid) {
      console.error("Evidence display is missing critical information.");
      return;
    }

    const web3 = new Web3(rpcURL && decodeURIComponent(rpcURL));

    const realitioProxyContractInstance = new web3.eth.Contract(RealitioProxyContract.abi, arbitrableContractAddress);

    const realitioContractAddress = await realitioProxyContractInstance.methods.realitio().call();
    const disputeIDToQuestionIDLogs = await realitioProxyContractInstance.methods.externalIDtoLocalID(disputeID).call();
    if (!disputeIDToQuestionIDLogs) return;

    const questionID = web3.utils.toHex(disputeIDToQuestionIDLogs);


    const queryQuestion = `{
      questions(first:5, where: {questionId: "${questionID}"}){
        data
        template{
          questionText
        }
      }
    }`


    const res = await fetch(subgraphs[cid], {
      method: 'POST',
      body: JSON.stringify({
        query: queryQuestion
      })
    }).then(res => res.json())

    this.setState({
      questionID,
      chainID: cid,
      realitioContractAddress,
      rawQuestion: res.data.questions[0].data,
      rawTemplate: res.data.questions[0].template.questionText,
    });
  }

  render() {
    const { questionID, chainID, realitioContractAddress, rawQuestion, rawTemplate } = this.state;
    if (!questionID) return <div />;

    const questionJSON = populatedJSONForTemplate(rawTemplate, rawQuestion);

    const safeMarkdown = questionJSON.format === 'text/markdown' && !(questionJSON.errors && questionJSON.errors.unsafe_markdown);
    const questionTitleHTML = safeMarkdown? DOMPurify.sanitize(questionJSON["title_html"]): '';
    const questionTitle = safeMarkdown? '': questionJSON["title"];

    return (
      <div
        style={{
          backgroundColor: "#f0f4f8",
          padding: "16px",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <div>
          <img src={RealityLogo} alt="Logo of reality.eth" style={{ maxWidth: "100%" }} />
        </div>
        <hr
          style={{
            height: "3px",
            border: "none",
            backgroundSize: "contain",
            color: "#27b4ee",
            background: "linear-gradient(45deg, #24b3ec 0%, #24b3ec 93%, #b9f9fb  93%, #b9f9fb  95%, #dcfb6c 95%)",
          }}
        />
        <div
          style={{
            marginTop: "16px",
            marginBottom: "32px",
            fontSize: "18x",
            lineHeight: "1.4",
            wordBreak: "break-word",
          }}
        >
          <div dangerouslySetInnerHTML={{__html: questionTitleHTML}} /></div>
          <div >{questionTitle}</div>
        <a
          style={{ color: "#2093ff" }}
          href={`https://reality.eth.link/app/index.html#!/network/${chainID}/question/${realitioContractAddress}-${questionID}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          See on reality.eth
        </a>
      </div>
    );
  }
}

export default RealitioDisplayInterface;
