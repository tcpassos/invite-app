import { renderToStaticMarkup } from 'react-dom/server';
import { TemplateSet } from './template-set';

const props = {
  eventName: 'Aniversário',
  eventDate: 'sábado, 20 de outubro',
  location: 'Salão de festas',
  style: {},
};

describe('TemplateSet', () => {
  it.each([
    ['classic', 'invite-template--classic'],
    ['botanical', 'invite-template--botanical'],
    ['modern', 'invite-template--modern'],
  ])('renders the %s template variant', (templateCode, className) => {
    const markup = renderToStaticMarkup(<TemplateSet {...props} templateCode={templateCode} />);

    expect(markup).toContain(className);
    expect(markup).toContain('Aniversário');
    expect(markup).toContain('Salão de festas');
  });
});
