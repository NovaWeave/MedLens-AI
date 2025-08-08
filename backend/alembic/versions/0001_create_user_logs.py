from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_create_user_logs'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'user_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('type', sa.String(length=50), index=True, nullable=False),
        sa.Column('input_text', sa.Text(), nullable=False),
        sa.Column('result_summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )


def downgrade() -> None:
    op.drop_table('user_logs')


