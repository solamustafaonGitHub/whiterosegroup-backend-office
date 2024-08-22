import React, { useEffect, useState } from 'react';
import { Box, Button, H2, H5, Illustration, Text } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import { useTranslation } from 'adminjs';
import { ApiClient } from 'adminjs';
import RocketSVG from './utils/rocket-svg.js';
import DiscordLogo from './utils/discord-logo-svg.js';
const pageHeaderHeight = 300;
const pageHeaderPaddingY = 74;
const pageHeaderPaddingX = 250;
const [data, setData] = useState(null);
const api = new ApiClient();
useEffect(() => {
    api.getDashboard()
        .then((response) => {
        setData(response.data);
    })
        .catch((error) => {
    });
}, []);
console.log(data.message);
export const DashboardHeader = () => {
    const { translateMessage } = useTranslation();
    return (React.createElement(Box, { "data-css": "default-dashboard" },
        React.createElement(Box, { position: "relative", overflow: "hidden", bg: "white", height: pageHeaderHeight, py: pageHeaderPaddingY, px: ['default', 'lg', pageHeaderPaddingX] },
            React.createElement(Box, { position: "absolute", top: 30, left: 0, opacity: 0.9, animate: true, display: ['none', 'none', 'none', 'block'] },
                React.createElement(RocketSVG, null)),
            React.createElement(Text, { textAlign: "center", color: "grey100" },
                React.createElement(H2, { fontWeight: "bold" }, translateMessage('welcomeOnBoard_title')),
                React.createElement(Text, { opacity: 0.8 }, translateMessage('welcomeOnBoard_subtitle'))))));
};
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
const Card = styled(Box) `
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
export const Dashboard = () => {
    const { translateMessage, translateButton } = useTranslation();
    return (React.createElement(Box, null,
        React.createElement(DashboardHeader, null),
        React.createElement(Box, { mt: ['xl', 'xl', '-100px'], mb: "xl", mx: [0, 0, 0, 'auto'], px: ['default', 'lg', 'xxl', '0'], position: "relative", flex: true, flexDirection: "row", flexWrap: "wrap", width: [1, 1, 1, 1024] },
            boxes({ translateMessage }).map((box, index) => (React.createElement(Box, { key: index, width: [1, 1 / 2, 1 / 2, 1 / 3], p: "lg" },
                React.createElement(Card, { as: "a", href: box.href, target: "_blank" },
                    React.createElement(Text, { textAlign: "center" },
                        React.createElement(Illustration, { variant: box.variant, width: 100, height: 70 }),
                        React.createElement(H5, { mt: "md" }, box.title),
                        React.createElement(Text, null, box.subtitle)))))),
            React.createElement(Card, { width: 1, m: "lg" },
                React.createElement(Text, { textAlign: "center" },
                    React.createElement(Illustration, { variant: "AdminJSLogo" }),
                    React.createElement(H5, null, translateMessage('needMoreSolutions_title')),
                    React.createElement(Text, null, translateMessage('needMoreSolutions_subtitle')),
                    React.createElement(Text, { mt: "xxl" },
                        React.createElement(Button, { as: "a", variant: "contained", href: "https://forms.adminjs.co/", target: "_blank" }, translateButton('contactUs'))))),
            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "https://adminjs.page.link/discord", target: "_blank" },
                    React.createElement(Box, { flexShrink: 0, className: "dsc-icon" },
                        React.createElement(DiscordLogo, null)),
                    React.createElement(Box, { ml: "xl" },
                        React.createElement(H5, null, translateMessage('community_title')),
                        React.createElement(Text, null, translateMessage('community_subtitle'))))),
            React.createElement(Box, { width: [1, 1, 1 / 2], p: "lg" },
                React.createElement(Card, { as: "a", flex: true, href: "https://github.com/SoftwareBrothers/adminjs/issues", target: "_blank" },
                    React.createElement(Box, { flexShrink: 0, className: "gh-icon" },
                        React.createElement(Illustration, { variant: "GithubLogo" })),
                    React.createElement(Box, { ml: "xl" },
                        React.createElement(H5, null, translateMessage('foundBug_title')),
                        React.createElement(Text, null, translateMessage('foundBug_subtitle'))))))));
};
export default Dashboard;
