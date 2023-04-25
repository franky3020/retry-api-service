import { TestBed } from '@angular/core/testing';

import {API_MAX_SEND_TIME, PlatinumApiService, TokenExpiredError, TokenInValidError} from './platinum-api.service';

describe('PlatinumApiService', () => {
  let service: PlatinumApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatinumApiService);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('when token expired then token is invalid', () => {
    spyOn(service, 'getIsTokenExpired').and.returnValue(true);
    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(false);
  });

  it('when token empty then token is invalid', () => {
    spyOn(service, 'getToken').and.returnValue('');
    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(false);
  });

  it('when token is expired then token is invalid', () => {


    spyOn(service, 'getToken').and.returnValue('have some thing');
    spyOn(service, 'getIsTokenExpired').and.returnValue(true);

    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(false);
  });

  it('when token is not expired and has value then token is valid', () => {

    spyOn(service, 'getToken').and.returnValue('have some thing');
    spyOn(service, 'getIsTokenExpired').and.returnValue(false);

    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(true);
  });

  it('when platinum api throw invalid error', async () => {

    let sendApiToPlatinumSpy = spyOn(service, 'sendApiToPlatinum').and.returnValue(
      new Promise((resolve)=>{ throw new TokenInValidError()})
    );

    await expectAsync(service.sendApi()).toBeRejectedWith(new TokenInValidError());
    expect(sendApiToPlatinumSpy).toHaveBeenCalledTimes(1);

  });

  it('when platinum api success', async () => {


    let successRes = "GOOD you are best";
    let sendApiToPlatinumSpy = spyOn(service, 'sendApiToPlatinum').and.returnValue(
      new Promise((resolve)=>{ return resolve(successRes) })
    );

    let res = await service.sendApi();
    expect(res).toBe(successRes);

    expect(sendApiToPlatinumSpy).toHaveBeenCalledTimes(1);

  });

  it('when platinum token expired then sendApiToPlatinum will call two time', async () => {

    service.setIsTokenExpired(true);
    let sendApiToPlatinumSpy = spyOn(service, 'sendApiToPlatinum').and.returnValue(
      new Promise((resolve)=>{throw new TokenExpiredError()})
    );

    await expectAsync(service.sendApi()).toBeRejectedWith(new TokenExpiredError());
    expect(sendApiToPlatinumSpy).toHaveBeenCalledTimes(API_MAX_SEND_TIME);

  });

  it('when platinum token invalid then sendApiToPlatinum will run resetTokenFromAPI()', async () => {

    spyOn(service, 'isTokenValid').and.returnValues(false, true);
    let resetTokenFromAPISpy = spyOn(service, 'resetTokenFromAPI');

    let res = await service.sendApiToPlatinum();
    expect(resetTokenFromAPISpy).toHaveBeenCalledTimes(1);
    expect(res).toBeInstanceOf(String);
  });

  it('when platinum token invalid after the resetTokenFromAPI() then throw TokenInValidError()', async () => {

    spyOn(service, 'isTokenValid').and.returnValues(true, false); // 第二次呼叫時 為不合法

    await expectAsync(service.sendApiToPlatinum()).toBeRejectedWith(new TokenInValidError());
  });

  it('resetTokenFromAPI()', async () => {
    let mockToken = "mock_token";
    spyOn(service, 'mockGetTokenFromFBO').and.returnValue(new Promise((resolve)=>{
      resolve(mockToken);
    }));

    await service.resetTokenFromAPI();

    expect(service.getToken()).toBe(mockToken);
    expect(service.getIsTokenExpired()).toBe(true);

  });

  it('mockGetTokenFromFBO()', async () => {

    let token  = await service.mockGetTokenFromFBO();
    expect(token).toBe('token_from_fbo');
  });



});
