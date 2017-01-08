import { HypotheticalPage } from './app.po';

describe('hypothetical App', function() {
  let page: HypotheticalPage;

  beforeEach(() => {
    page = new HypotheticalPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
