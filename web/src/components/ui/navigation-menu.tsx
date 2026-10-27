import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu';
import { cva } from 'class-variance-authority';
import { cn } from 'cn';

// Ajustado ao mega menu da loja: o painel abre em largura cheia embaixo do header (o anchor vem de quem usa), e só
// opacity e translate animam. O original anima largura, altura e posição, que recalculam o layout a cada quadro.
// O Root não monta o Positioner sozinho: quem usa põe o NavigationMenuPositioner com o anchor.

function NavigationMenu({ className, ...props }: NavigationMenuPrimitive.Root.Props) {
  return <NavigationMenuPrimitive.Root data-slot="navigation-menu" className={cn('relative', className)} {...props} />;
}

function NavigationMenuList({ className, ...props }: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn('flex list-none items-center gap-0.5', className)}
      {...props}
    />
  );
}

function NavigationMenuItem(props: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" {...props} />;
}

// Item do header escuro, com ou sem painel: o aberto fica marcado como o hover. Usado sem o cn: ele trata o
// text-body como cor e o descarta ao lado do text-gray-0, e o botão cairia nos 16px do body.
const navigationMenuTriggerStyle = cva(
  'inline-flex h-ctl items-center gap-2 rounded-pill px-2.5 text-body font-semibold whitespace-nowrap text-gray-0 transition-colors duration-base outline-none hover:bg-ink-soft focus-visible:bg-ink-soft data-popup-open:bg-ink-soft xl:px-3.5',
);

function NavigationMenuTrigger(props: Omit<NavigationMenuPrimitive.Trigger.Props, 'className'>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={navigationMenuTriggerStyle()}
      {...props}
    />
  );
}

// O conteúdo que sai fica por cima (position: absolute, do Base UI) enquanto some, e o que entra aparece no lugar.
function NavigationMenuContent({ className, ...props }: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        'w-full transition-opacity duration-slow ease-out data-ending-style:opacity-0 data-starting-style:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

// fixed: o header é sticky, e o painel acompanha a rolagem sem recalcular a posição a cada scroll.
function NavigationMenuPositioner({ className, ...props }: NavigationMenuPrimitive.Positioner.Props) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        data-slot="navigation-menu-positioner"
        side="bottom"
        align="start"
        sideOffset={0}
        positionMethod="fixed"
        collisionAvoidance={{ side: 'none', align: 'none' }}
        className={cn('z-50 w-(--anchor-width)', className)}
        {...props}
      >
        <NavigationMenuPrimitive.Popup className="relative mx-2 overflow-hidden rounded-b-block bg-popover text-popover-foreground shadow-pop transition-[opacity,translate] duration-slow ease-out outline-none data-ending-style:-translate-y-2 data-ending-style:opacity-0 data-starting-style:-translate-y-2 data-starting-style:opacity-0 sm:mx-4">
          <NavigationMenuPrimitive.Viewport className="relative w-full" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

// Fecha o painel ao clicar: o layout continua montado na navegação, e o painel ficaria aberto sobre a página nova.
function NavigationMenuLink({ closeOnClick = true, ...props }: NavigationMenuPrimitive.Link.Props) {
  return <NavigationMenuPrimitive.Link data-slot="navigation-menu-link" closeOnClick={closeOnClick} {...props} />;
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
};
