import type { CSSProperties } from "react";
import { GenerateSvgPenTool } from "../icons/PenTool";

type ThemeIconProps = {
    themeName: string;
    style?: CSSProperties;
};

export const GenerateThemeIcon = (React) => {
    const SvgPenTool = GenerateSvgPenTool(React);
    
    const ThemeIcon: React.FC<ThemeIconProps> = ({ themeName, style }) => {
        switch(themeName) {
            case 'Sepia':
                return <SvgPenTool style={style} />
        }
        return <div style={style}>{themeName}</div>;
    };

    return ThemeIcon;
}
