"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashboard = exports.DashboardHeader = void 0;
const react_1 = __importStar(require("react"));
const design_system_1 = require("@adminjs/design-system");
const styled_components_1 = require("@adminjs/design-system/styled-components");
const adminjs_1 = require("adminjs");
const adminjs_2 = require("adminjs");
const rocket_svg_js_1 = __importDefault(require("./utils/rocket-svg.js"));
const discord_logo_svg_js_1 = __importDefault(require("./utils/discord-logo-svg.js"));
const pageHeaderHeight = 300;
const pageHeaderPaddingY = 74;
const pageHeaderPaddingX = 250;
const DashboardHeader = () => {
    const { translateMessage } = (0, adminjs_1.useTranslation)();
    return (<design_system_1.Box data-css="default-dashboard">
      <design_system_1.Box position="relative" overflow="hidden" bg="white" height={pageHeaderHeight} py={pageHeaderPaddingY} px={['default', 'lg', pageHeaderPaddingX]}>
        <design_system_1.Box position="absolute" top={30} left={0} opacity={0.9} animate display={['none', 'none', 'none', 'block']}>
          <rocket_svg_js_1.default />
        </design_system_1.Box>
        <design_system_1.Text textAlign="center" color="grey100">
          <design_system_1.H2 fontWeight="bold">{translateMessage('welcomeOnBoard_title')}</design_system_1.H2>
          <design_system_1.Text opacity={0.8}>{translateMessage('welcomeOnBoard_subtitle')}</design_system_1.Text>
        </design_system_1.Text>
      </design_system_1.Box>
    </design_system_1.Box>);
};
exports.DashboardHeader = DashboardHeader;
const boxes = ({ translateMessage }) => [
    {
        variant: 'Details',
        title: translateMessage('addingResources_title'),
        subtitle: translateMessage('addingResources_subtitle'),
        href: 'https://docs.adminjs.co/basics/resource#providing-resources-explicitly',
    },
    {
        variant: 'Docs',
        title: translateMessage('customizeResources_title'),
        subtitle: translateMessage('customizeResources_subtitle'),
        href: 'https://docs.adminjs.co/basics/resource#customizing-resources',
    },
    {
        variant: 'Plug',
        title: translateMessage('customizeActions_title'),
        subtitle: translateMessage('customizeActions_subtitle'),
        href: 'https://docs.adminjs.co/basics/action',
    },
    {
        variant: 'Cup',
        title: translateMessage('writeOwnComponents_title'),
        subtitle: translateMessage('writeOwnComponents_subtitle'),
        href: 'https://docs.adminjs.co/ui-customization/writing-your-own-components',
    },
    {
        variant: 'Photos',
        title: translateMessage('customDashboard_title'),
        subtitle: translateMessage('customDashboard_subtitle'),
        href: 'https://docs.adminjs.co/ui-customization/dashboard-customization',
    },
    {
        variant: 'IdentityCard',
        title: translateMessage('roleBasedAccess_title'),
        subtitle: translateMessage('roleBasedAccess_subtitle'),
        href: 'https://docs.adminjs.co/tutorials/adding-role-based-access-control',
    },
];
const Card = (0, styled_components_1.styled)(design_system_1.Box) `
  display: ${({ flex }) => (flex ? 'flex' : 'block')};
  color: ${({ theme }) => theme.colors.grey100};
  height: 100%;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.space.md};
  transition: all 0.1s ease-in;

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.primary60};
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }

  & .dsc-icon svg, .gh-icon svg {
    width: 64px;
    height: 64px;
  }
`;
Card.defaultProps = {
    variant: 'container',
    boxShadow: 'card',
};
const Dashboard = () => {
    const { translateMessage, translateButton } = (0, adminjs_1.useTranslation)();
    const [data, setData] = (0, react_1.useState)(null);
    const api = new adminjs_2.ApiClient();
    (0, react_1.useEffect)(() => {
        api.getDashboard()
            .then((response) => {
            setData(response.data);
        })
            .catch((error) => {
            // Handle error appropriately
            console.error(error);
        });
    }, []);
    (0, react_1.useEffect)(() => {
        if (data) {
            console.log(data.message);
        }
    }, [data]);
    return (<design_system_1.Box>
      <exports.DashboardHeader />
      <design_system_1.Box mt={['xl', 'xl', '-100px']} mb="xl" mx={[0, 0, 0, 'auto']} px={['default', 'lg', 'xxl', '0']} position="relative" flex flexDirection="row" flexWrap="wrap" width={[1, 1, 1, 1024]}>
        {boxes({ translateMessage }).map((box, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <design_system_1.Box key={index} width={[1, 1 / 2, 1 / 2, 1 / 3]} p="lg">
            <Card as="a" href={box.href} target="_blank">
              <design_system_1.Text textAlign="center">
                <design_system_1.Illustration variant={box.variant} width={100} height={70}/>
                <design_system_1.H5 mt="md">{box.title}</design_system_1.H5>
                <design_system_1.Text>{box.subtitle}</design_system_1.Text>
              </design_system_1.Text>
            </Card>
          </design_system_1.Box>))}
        <Card width={1} m="lg">
          <design_system_1.Text textAlign="center">
            <design_system_1.Illustration variant="AdminJSLogo"/>
            <design_system_1.H5>{translateMessage('needMoreSolutions_title')}</design_system_1.H5>
            <design_system_1.Text>{translateMessage('needMoreSolutions_subtitle')}</design_system_1.Text>
            <design_system_1.Text mt="xxl">
              <design_system_1.Button as="a" variant="contained" href="https://forms.adminjs.co/" target="_blank">
                {translateButton('contactUs')}
              </design_system_1.Button>
            </design_system_1.Text>
          </design_system_1.Text>
        </Card>
        <design_system_1.Box width={[1, 1, 1 / 2]} p="lg">
          <Card as="a" flex href="https://adminjs.page.link/discord" target="_blank">
            <design_system_1.Box flexShrink={0} className="dsc-icon">
              <discord_logo_svg_js_1.default />
            </design_system_1.Box>
            <design_system_1.Box ml="xl">
              <design_system_1.H5>{translateMessage('community_title')}</design_system_1.H5>
              <design_system_1.Text>{translateMessage('community_subtitle')}</design_system_1.Text>
            </design_system_1.Box>
          </Card>
        </design_system_1.Box>
        <design_system_1.Box width={[1, 1, 1 / 2]} p="lg">
          <Card as="a" flex href="https://github.com/SoftwareBrothers/adminjs/issues" target="_blank">
            <design_system_1.Box flexShrink={0} className="gh-icon">
              <design_system_1.Illustration variant="GithubLogo"/>
            </design_system_1.Box>
            <design_system_1.Box ml="xl">
              <design_system_1.H5>{translateMessage('foundBug_title')}</design_system_1.H5>
              <design_system_1.Text>{translateMessage('foundBug_subtitle')}</design_system_1.Text>
            </design_system_1.Box>
          </Card>
        </design_system_1.Box>
      </design_system_1.Box>
    </design_system_1.Box>);
};
exports.Dashboard = Dashboard;
exports.default = exports.Dashboard;
