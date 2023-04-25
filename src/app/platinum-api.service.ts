import { Injectable } from '@angular/core';

export const API_MAX_SEND_TIME = 2;

@Injectable({
  providedIn: 'root'
})
export class PlatinumApiService {

  private _token = '';
  private _isTokenExpired = true;

  constructor() { }

  /**
   * 處理 發送 API 時的流程:
   * . 當發送後的 res 回應成功, 則回傳成功的 req
   * . 當遇到 token 無效, 則要先取得 token
   * . 當發送後的 res 回應 token 已經過期, 則重新拿取 token, 且再次發送API
   * . 當發送後的 res 回應  token 無效, 則拋出例外
   * . 當發送後的 res 無回應, 則拋出例外
   * . 當發送後的 res 回應其他錯誤, 則拋出例外
   */
  async sendApi() {

    let apiSendTime = 0;

    let res = '';

    let error: Error = new Error('unknown Error');

    while (apiSendTime < API_MAX_SEND_TIME) {
      try {
        res = await this.sendApiToPlatinum();
        return res;
      } catch (err: any) {
        error = err;
        if (err instanceof TokenExpiredError) {
          // to retry
        } else {
          throw err;
        }

      } finally {
        apiSendTime++;
      }
    }
    throw error;
  }

  /**
   * 先檢查 token 是否有效, 才開始送出API
   * 可能拋出 [token 過期, token 無效, 無回應]的例外
   * TODO: 無回應例外 須等未來有API後才實作
   */
  async sendApiToPlatinum(): Promise<string> {

    if (!this.isTokenValid()) {
      await this.resetTokenFromAPI();
    }

    if (!this.isTokenValid()) {
      throw new TokenInValidError();
    }

    //  發送API到廠商那 有可能 throw 過期 TokenExpiredError

    return "{mockJson:''}";
  }

  /**
   * 跟 FBO 中台拿 token, 且重設 token
   */
  async resetTokenFromAPI() {
    let token = await this.mockGetTokenFromFBO();
    this.setToken(token);
    this._isTokenExpired = true;
  }

  /**
   * if not expired or has token
   */
  isTokenValid() {
    if (this.getToken() === '' || this.getIsTokenExpired()) {
      return false;
    } else {
      return true;
    }
  }


  mockGetTokenFromFBO(): Promise<string> {
    return new Promise(async (resolve) => {
      await sleep(1000);
      return resolve('token_from_fbo');
    });
  }

  getIsTokenExpired(): boolean {
    return this._isTokenExpired;
  }
  setIsTokenExpired(isTokenExpired: boolean) {
    this._isTokenExpired = isTokenExpired;
  }

  getToken(): string {
    return this._token;
  }

  setToken(token: string) {
    this._token = token;
  }

}


export class TokenExpiredError extends Error {

  constructor() {
    super('TokenExpiredError');
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }

}

export class TokenInValidError extends Error {
  constructor() {
    super('TokenInValidError');
    Object.setPrototypeOf(this, TokenInValidError.prototype);
  }

}

function sleep(millisecond: number): Promise<void> {
  return new Promise((resolve) => {setTimeout(()=>{return resolve();}, millisecond)});
}
