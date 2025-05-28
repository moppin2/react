// src/components/common/ActionPopoverMenu.jsx
import React from 'react';
import {
    useFloating,
    offset,
    flip,
    shift,
    autoUpdate,
    useDismiss,
    useRole,
    useInteractions,
    FloatingFocusManager,
    FloatingPortal
} from '@floating-ui/react';
import './ActionPopoverMenu.css';

export default function ActionPopoverMenu({
    anchorElement,   // <<--- 메뉴를 띄울 기준 DOM 요소 (부모가 전달)
    isOpen,
    onClose,
    menuItems = [],
    placement = 'bottom-start',
    offsetValue = 8,
}) {
    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: onClose,
        placement: placement,
        whileElementsMounted: autoUpdate,
        elements: { // anchorElement를 reference로 직접 사용
            reference: anchorElement,
        },
        middleware: [
            offset(offsetValue),
            flip({ padding: 8 }),
            shift({ padding: 8 }),
        ],
    });

    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'menu' });

    const { getFloatingProps } = useInteractions([
        dismiss,
        role,
    ]);

    if (!isOpen || !anchorElement) { // isOpen과 anchorElement 모두 유효해야 함
        return null;
    }

    return (
        <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
                <div
                    ref={refs.setFloating}
                    style={floatingStyles}
                    className="action-popover-menu"
                    {...getFloatingProps()}
                >
                    <ul>
                        {menuItems.map((item, index) => {
                            if (item.isSeparator) {
                                return <li key={`separator-${index}`} className="menu-separator" role="separator" />;
                            }
                            return (
                                <li key={item.label || index} role="menuitem">
                                    <button
                                        onClick={() => {
                                            if (item.action) item.action();
                                            onClose();
                                        }}
                                        disabled={item.disabled || false}
                                        className="menu-item-button"
                                    >
                                        {item.icon && <span className="menu-item-icon">{item.icon}</span>}
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </FloatingFocusManager>
        </FloatingPortal>
    );
}