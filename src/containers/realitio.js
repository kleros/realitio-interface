import React, { Component } from "react";
import styled from "styled-components/macro";
import Web3 from "web3";

import RealitioContract from "../assets/contracts/realitio.json";
import RealitioProxyContract from "../assets/contracts/realitio-proxy.json";
import RealitioLogo from "../assets/images/realitio_logo.png";

const web3 = new Web3(window.web3 ? window.web3.currentProvider || "https://mainnet.infura.io/v3/668b3268d5b241b5bab5c6cb886e4c61" : "https://mainnet.infura.io/v3/668b3268d5b241b5bab5c6cb886e4c61");
// Global CSS
const QuestionText = styled.div`
  margin-bottom: 15px;
  font-family: "Roboto", sans-serif;
  font-size: 20px;
  font-variant: tabular-nums;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.65);
  background-color: #fff;
`;
const QuestionLink = styled.a`
  margin-top: 0px;
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  font-variant: tabular-nums;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.65);
  background-color: #fff;
  color: #2093ff;
`;

const Header = styled.div`
  height: 80px;
  margin-bottom: 25px;
  overflow-x: hidden;
  img {
    height: 50%;
    margin: 16px;
  }
`;

const SquareLeft = styled.div`
  position: absolute;
  left: -35px;
  top: -190px;
  width: 100%;
  height: 180px;
  background-color: #56bbe8;
  transform: rotate(-10deg);
  z-index: -1;
`;

const SquareRight = styled.div`
  position: absolute;
  right: -40px;
  top: -160px;
  width: 100%;
  height: 180px;
  background-color: #cae940;
  transform: rotate(4deg);
  z-index: -2;
`;

class RealitioDisplayInterface extends Component {
  state = { question: null };

  async componentDidMount() {
    if (window.location.search[0] !== "?") return;
    const message = JSON.parse(window.location.search.substring(1).replace(/%22/g, '"').replace(/%7B/g, "{").replace(/%3A/g, ":").replace(/%2C/g, ",").replace(/%7D/g, "}"));

    const { arbitrableContractAddress, arbitratorContractAddress, disputeID } = message;

    if (!arbitrableContractAddress || !disputeID || !arbitratorContractAddress) return;

    let question = {};

    const realitioProxyContractInstance = new web3.eth.Contract(RealitioProxyContract.abi, arbitrableContractAddress);

    const realitioContractAddress = await realitioProxyContractInstance.methods.realitio().call();
    const realitioContractInstance = new web3.eth.Contract(RealitioContract.abi, realitioContractAddress);

    console.debug(`realitio ${realitioContractAddress}`);

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

    console.debug(`questionID ${questionID}`);

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

    console.debug(`templateID ${templateID}`);
    console.debug(templateEventLog);

    const template = JSON.parse(templateEventLog[0].returnValues.question_text);
    console.debug(template);

    const questionText = questionEventLog[0].returnValues.question.split("\u241f");
    question.text = questionText;

    this.setState({ question, template });
  }

  render() {
    const { question, template } = this.state;
    if (!question) return <div />;

    for (var i = 0; i < question.text.length; i++) {
      template.title = template.title.replace("%s", question.text[i]);
    }

    return (
      <div>
        <Header>
          <SquareLeft />
          <SquareRight />
          <img src={RealitioLogo} />
        </Header>
        <QuestionText>{template.title}</QuestionText>
        <QuestionLink href={`https://realitio.github.io/#!/question/${question.questionID}`} target="_blank" rel="noopener noreferrer">
          Question Details
        </QuestionLink>
      </div>
    );
  }
}

export default RealitioDisplayInterface;
