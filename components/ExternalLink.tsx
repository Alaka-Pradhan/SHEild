import { Linking, Text } from 'react-native';

type Props = {
  href: string;
  children: React.ReactNode;
};

export function ExternalLink({ href, children, ...rest }: Props) {
  const handlePress = () => {
    Linking.openURL(href).catch(() => {});
  };

  return (
    <Text accessibilityRole="link" onPress={handlePress} {...rest}>
      {children}
    </Text>
  );
}
