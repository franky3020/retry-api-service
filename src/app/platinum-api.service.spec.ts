import { TestBed } from '@angular/core/testing';

import {PlatinumApiService, TokenExpiredError, TokenInValidError} from './platinum-api.service';

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

  it('when token empty then token is invalid', () => {
    service.setToken('');
    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(false);
  });

  it('when token empty then token is invalid', () => {
    service.setToken('');
    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(false);
  });

  it('when token is expired then token is invalid', () => {
    service.setToken('sdfasd');
    service.isTokenExpired = true;

    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(false);
  });

  it('when token is not expired and has value then token is valid', () => {
    service.setToken('sdfasd');
    service.isTokenExpired = false;

    let isTokenValid= service.isTokenValid();
    expect(isTokenValid).toBe(true);
  });

  it('when platinum api throw invalid error', async () => {

    let service: PlatinumApiService;
    service = TestBed.inject(PlatinumApiService);
    service.isTokenValid = () => {
      return false;
    }
    await expectAsync(service.sendApi()).toBeRejectedWith(new TokenInValidError());
  });

  it('when platinum api success', async () => {

    let service: PlatinumApiService;
    service = TestBed.inject(PlatinumApiService);
    service.isTokenValid = () => {
      return true;
    }

    let res = await service.sendApi();
    expect(res).toBe("{mockJson:''}");
  });

  it('when platinum token expired then sendApiToPlatinum will call two time', async () => {

    let service: PlatinumApiService;
    service = TestBed.inject(PlatinumApiService);
    service.isTokenExpired = true;
    let sendApiToPlatinumSpy = spyOn(service, 'sendApiToPlatinum').and.returnValue(
      new Promise((resolve)=>{throw new TokenExpiredError()})
    );

    await expectAsync(service.sendApi()).toBeRejectedWith(new TokenExpiredError());
    expect(sendApiToPlatinumSpy).toHaveBeenCalledTimes(2);

  });


});
