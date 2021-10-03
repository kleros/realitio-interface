import React, { Component } from "react";
import Web3 from "web3";

import RealitioContract from "../assets/contracts/realitio.json";
import RealitioProxyContract from "../assets/contracts/realitio-proxy.json";
import RealityLogo from "../assets/images/realitio_logo.png";

class RealitioDisplayInterface extends Component {
  state = { question: null };

  async componentDidMount() {
    if (window.location.search[0] !== "?") return;

    const message = JSON.parse(decodeURIComponent(window.location.search.substring(1)));

    const { arbitrableContractAddress, arbitratorContractAddress, disputeID, chainID, jsonRpcUrl } = message;

    const web3 = new Web3(decodeURIComponent(jsonRpcUrl) || window.web3.currentProvider);

    if (!arbitrableContractAddress || !disputeID || !arbitratorContractAddress) return;

    let question = {};

    const realitioProxyContractInstance = new web3.eth.Contract(RealitioProxyContract.abi, arbitrableContractAddress);

    const realitioContractAddress = await realitioProxyContractInstance.methods.realitio().call();
    const realitioContractInstance = new web3.eth.Contract(RealitioContract.abi, realitioContractAddress);

    const disputeIDToQuestionIDLogs = await realitioProxyContractInstance.getPastEvents("DisputeIDToQuestionID", {
      filter: {
        _disputeID: disputeID,
      },
      fromBlock: 0,
      toBlock: "latest",
    });

    if (disputeIDToQuestionIDLogs.length !== 1) return;

    const questionID = disputeIDToQuestionIDLogs[0].returnValues._questionID;
    question.questionID = questionID;

    const questionEventLog = await realitioContractInstance.getPastEvents("LogNewQuestion", {
      filter: {
        question_id: questionID,
      },
      fromBlock: 0,
      toBlock: "latest",
    });

    const templateID = questionEventLog[0].returnValues.template_id;
    const templateEventLog = await realitioContractInstance.getPastEvents("LogNewTemplate", {
      filter: {
        template_id: templateID,
      },
      fromBlock: 0,
      toBlock: "latest",
    });

    const template = JSON.parse(templateEventLog[0].returnValues.question_text);

    const questionText = questionEventLog[0].returnValues.question.split("\u241f");
    question.text = questionText;

    this.setState({ question, template, chainID, realitioContractAddress });
  }

  render() {
    const { question, template, chainID, realitioContractAddress } = this.state;
    if (!question) return <div />;

    for (var i = 0; i < question.text.length; i++) {
      template.title = template.title.replace("%s", question.text[i]);
    }

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
          {template.title}
        </div>
        <a
          style={{ color: "#2093ff" }}
          href={`https://reality.eth.link/app/index.html#!/network/${chainID}/question/${realitioContractAddress}-${question.questionID}`}
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
