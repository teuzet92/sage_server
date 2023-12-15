const axios = require('axios');
const axiosRetry = require('axios-retry');

const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];
const ENDPOINT = 'https://api.mistral.ai';

/**
 * MistralClient
 * @return {MistralClient}
 */
class MistralClient {
  /**
   * A simple and lightweight client for the Mistral API
   * @param {*} apiKey can be set as an environment variable MISTRAL_API_KEY,
   * or provided in this parameter
   * @param {*} endpoint defaults to https://api.mistral.ai
   */
  constructor(apiKey=process.env.MISTRAL_API_KEY, endpoint = ENDPOINT) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;

    this.textDecoder = new TextDecoder();
  }

  /**
   *
   * @param {*} method
   * @param {*} path
   * @param {*} request
   * @return {Promise<*>}
   */
  _request = async function(method, path, request) {
    const response = await axios({
      method: method,
      url: `${this.endpoint}/${path}`,
      data: request,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      responseType: request?.stream ? 'stream' : 'json',
    }).catch((error) => {
      console.error(error);
      return error.response;
    });
    return response.data;
  };

  /**
   * Creates a chat completion request
   * @param {*} model
   * @param {*} messages
   * @param {*} temperature
   * @param {*} maxTokens
   * @param {*} topP
   * @param {*} randomSeed
   * @param {*} stream
   * @param {*} safeMode
   * @return {Promise<Object>}
   */
  _makeChatCompletionRequest = function(
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    stream,
    safeMode,
  ) {
    return {
      model: model,
      messages: messages,
      temperature: temperature ?? undefined,
      max_tokens: maxTokens ?? undefined,
      top_p: topP ?? undefined,
      random_seed: randomSeed ?? undefined,
      stream: stream ?? undefined,
      safe_prompt: safeMode ?? undefined,
    };
  };


  /**
   * Returns a list of the available models
   * @return {Promise<Object>}
   */
  listModels = async function() {
    const response = await this._request('get', 'v1/models');
    return response;
  };

  /**
   * A chat endpoint without streaming
   * @param {*} model the name of the model to chat with, e.g. mistral-tiny
   * @param {*} messages an array of messages to chat with, e.g.
   * [{role: 'user', content: 'What is the best French cheese?'}]
   * @param {*} temperature the temperature to use for sampling, e.g. 0.5
   * @param {*} maxTokens the maximum number of tokens to generate, e.g. 100
   * @param {*} topP the cumulative probability of tokens to generate, e.g. 0.9
   * @param {*} randomSeed the random seed to use for sampling, e.g. 42
   * @param {*} safeMode whether to use safe mode, e.g. true
   * @return {Promise<Object>}
   */
  chat = async function({
    model,
    messages,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode}) {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      false,
      safeMode,
    );
    const response = await this._request(
      'post', 'v1/chat/completions', request,
    );
    return response;
  };
}

const apiKey = process.env.MISTRAL_API_KEY;
const mistralClient = new MistralClient(apiKey);

module.exports = class extends getClass('dweller') {
  async answer(messages, temperature = 1) {
    const response = await mistralClient.chat({
      model: 'mistral-medium',
      messages,
      temperature,
    });
    let answer = response.choices[0].message;
    return answer.content;
  }
}


